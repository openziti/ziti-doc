import React, {
    useMemo, useRef, useState, useCallback, useEffect, JSX
} from 'react';
import ReactEcharts from 'echarts-for-react';
import type {ECharts, EChartsOption, SeriesOption} from 'echarts';

import ziti from './all.ziti.stargazers.json';
import zrok from './all.zrok.stargazers.json';
import others from './all.other.stargazers.json';
import styles from "../new-landing/styles.module.css";
import {NetFoundryLayout} from "@openclint/docusaurus-shared/ui";
import {starProps} from "@openziti/src/components/consts"
import {openZitiFooter} from "@openziti/src/components/footer";

/* ------------------ Types & Constants ------------------ */
type StarEvent = { date: string };
type Point = [number, number];
type DateRange = [number, number] | null;

const DAY = 86_400_000;
const YEAR = 365 * DAY;
const CHART_HEIGHT = 620;
const DEBOUNCE_MS = 300;

const COLORS = {
    ziti: '#4F46E5',
    zrok: '#10B981',
    others: '#F59E0B',
    TOTAL: '#111',
} as const;

const REPOS = {
    ziti: { data: ziti as StarEvent[], label: 'openziti / ziti', color: COLORS.ziti },
    zrok: { data: zrok as StarEvent[], label: 'openziti / zrok', color: COLORS.zrok },
    others: { data: others as StarEvent[], label: 'openziti / others', color: COLORS.others },
} as const;

/* ------------------ Date Utilities ------------------ */
const dateUtils = {
    stripTime: (d: Date): Date =>
        new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),

    byDate: (a: StarEvent, b: StarEvent) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),

    parseLocalToUtc: (val: string): number => {
        if (!val) return NaN;
        const [date, time] = val.split("T");
        const [y, m, d] = date.split("-").map(Number);
        const [hh, mm] = time.split(":").map(Number);
        return Date.UTC(y, m - 1, d, hh, mm);
    },

    toInputValue: (ms: number): string =>
        new Date(ms).toISOString().slice(0, 16),

    formatDisplay: (ms: number): string =>
        new Date(ms).toISOString().slice(0, 10),

    tickFormat: (ts: number, span: number): string => {
        const d = new Date(ts);
        if (span > 2 * YEAR) {
            return d.getUTCMonth() === 0 && d.getUTCDate() === 1
                ? String(d.getUTCFullYear()) : '';
        }
        if (span > 90 * DAY) {
            return d.getUTCDate() === 1
                ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` : '';
        }
        return `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    }
};

/* ------------------ Data Processing ------------------ */
function processStarData(events: StarEvent[]) {
    const sorted = [...events].sort(dateUtils.byDate);

    // Daily counts
    const dailyMap = new Map<number, number>();
    for (const { date } of events) {
        const t = dateUtils.stripTime(new Date(date)).getTime();
        dailyMap.set(t, (dailyMap.get(t) || 0) + 1);
    }
    const daily = Array.from(dailyMap.entries()).sort((a, b) => a[0] - b[0]) as Point[];

    // Cumulative counts
    const cumulative: Point[] = [];
    let count = 0;
    for (const { date } of sorted) {
        count++;
        cumulative.push([new Date(date).getTime(), count]);
    }

    return { daily, cumulative };
}

function calculateStats(events: StarEvent[], range: DateRange) {
    if (!events.length) return null;

    const times = events
        .map(e => dateUtils.stripTime(new Date(e.date)).getTime())
        .sort((a, b) => a - b);

    const [minT, maxT] = range || [times[0], times[times.length - 1]];
    const inWindow = times.filter(t => t >= minT && t <= maxT);

    if (!inWindow.length) {
        return { stars: 0, days: 0, avgPerDay: 0, daysWithStars: 0, maxInOneDay: 0, dayWithMost: '—' };
    }

    const first = inWindow[0];
    const last = inWindow[inWindow.length - 1];
    const numDays = Math.max(1, Math.floor((last - first) / DAY) + 1);

    const dayMap = new Map<number, number>();
    for (const t of inWindow) {
        dayMap.set(t, (dayMap.get(t) || 0) + 1);
    }

    let maxDay = first;
    let maxCount = 0;
    for (const [t, c] of dayMap) {
        if (c > maxCount) {
            maxCount = c;
            maxDay = t;
        }
    }

    return {
        stars: inWindow.length,
        days: numDays,
        avgPerDay: +(inWindow.length / numDays).toFixed(3),
        daysWithStars: dayMap.size,
        maxInOneDay: maxCount,
        dayWithMost: dateUtils.formatDisplay(maxDay),
    };
}

function createSeriesPair(
    name: keyof typeof REPOS,
    color: string,
    daily: Point[],
    cumulative: Point[]
): SeriesOption[] {
    return [
        {
            name, xAxisIndex: 0, yAxisIndex: 0, type: 'line', smooth: true, showSymbol: false,
            itemStyle: { color }, lineStyle: { color, width: 2 },
            areaStyle: { color: color + '22' }, data: cumulative
        },
        {
            name, xAxisIndex: 1, yAxisIndex: 1, type: 'bar',
            itemStyle: { color }, data: daily
        }
    ];
}

/* ------------------ UI Components ------------------ */
interface ControlsProps {
    snapMidnight: boolean;
    setSnapMidnight: (snap: boolean) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    setIsDateEditing: (editing: boolean) => void;
}

function Controls({
                      snapMidnight, setSnapMidnight, startDate, setStartDate,
                      endDate, setEndDate, setIsDateEditing
                  }: ControlsProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '4px 0 12px', fontSize: '0.9rem'
        }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                    type="checkbox"
                    style={{ width: 14, height: 14 }}
                    checked={snapMidnight}
                    onChange={e => setSnapMidnight(e.target.checked)}
                />
                Snap to midnight UTC
            </label>
            <label>Start:&nbsp;
                <input
                    type="datetime-local"
                    value={startDate}
                    onFocus={() => setIsDateEditing(true)}
                    onBlur={() => setIsDateEditing(false)}
                    onChange={e => setStartDate(e.target.value)}
                />
            </label>
            <label>End:&nbsp;
                <input
                    type="datetime-local"
                    value={endDate}
                    onFocus={() => setIsDateEditing(true)}
                    onBlur={() => setIsDateEditing(false)}
                    onChange={e => setEndDate(e.target.value)}
                />
            </label>
        </div>
    );
}

interface StatsTableProps {
    rows: Array<{ label: string; color: string; stats: any }>;
    range: DateRange;
}

function StatsTable({ rows, range }: StatsTableProps) {
    return (
        <div style={{
            margin: '8px 0 12px',
            border: '1px solid var(--ifm-table-border-color,#e3e3e3)',
            borderRadius: 8, padding: 12
        }}>
            {range && (
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                    Date range: {dateUtils.formatDisplay(range[0])} → {dateUtils.formatDisplay(range[1])}
                </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                <tr>
                    <th style={{ textAlign: 'left' }}>Repo</th>
                    <th>Stars</th>
                    <th>Days</th>
                    <th>Avg/day</th>
                    <th>Days w/ stars</th>
                    <th>Max/day</th>
                    <th>Peak day</th>
                </tr>
                </thead>
                <tbody>
                {rows.map(({ label, color, stats }) => (
                    <tr key={label}>
                        <td>
                                <span style={{
                                    background: color, color: '#fff',
                                    padding: '2px 8px', borderRadius: 999
                                }}>
                                    {label}
                                </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{stats?.stars ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{stats?.days ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{stats?.avgPerDay ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{stats?.daysWithStars ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{stats?.maxInOneDay ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{stats?.dayWithMost ?? '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

/* ------------------ Main Component ------------------ */
export default function Stargazers(): JSX.Element {
    const chartRef = useRef<ECharts | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [range, setRange] = useState<DateRange>(null);
    const [liveSpan, setLiveSpan] = useState<number>(0);
    const [snapMidnight, setSnapMidnight] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDateEditing, setIsDateEditing] = useState(false);
    const [legendSelected, setLegendSelected] = useState({
        ziti: true, zrok: true, others: true, TOTAL: false
    });

    // Process all data once
    const processedData = useMemo(() => {
        const allEvents = [...REPOS.ziti.data, ...REPOS.zrok.data, ...REPOS.others.data];
        const totalData = processStarData(allEvents);

        return {
            ziti: processStarData(REPOS.ziti.data),
            zrok: processStarData(REPOS.zrok.data),
            others: processStarData(REPOS.others.data),
            total: totalData,
        };
    }, []);

    // Calculate global min/max
    const { globalMin, globalMax } = useMemo(() => {
        const allPoints = [
            ...processedData.ziti.cumulative,
            ...processedData.zrok.cumulative,
            ...processedData.others.cumulative
        ];
        return {
            globalMin: Math.min(...allPoints.map(p => p[0])),
            globalMax: Math.max(...allPoints.map(p => p[0]))
        };
    }, [processedData]);

    // Initialize date range
    useEffect(() => {
        if (!Number.isFinite(globalMin) || !Number.isFinite(globalMax)) return;

        const startMs = dateUtils.stripTime(new Date(globalMin)).getTime();
        const endMs = dateUtils.stripTime(new Date(globalMax)).getTime();

        setRange([startMs, endMs]);
        setLiveSpan(globalMax - globalMin);
        setStartDate(dateUtils.toInputValue(startMs));
        setEndDate(dateUtils.toInputValue(endMs));
    }, [globalMin, globalMax]);

    // Handle date input changes
    useEffect(() => {
        if (!startDate || !endDate) return;

        const start = dateUtils.parseLocalToUtc(startDate);
        const end = dateUtils.parseLocalToUtc(endDate);

        if (!isNaN(start) && !isNaN(end) && end > start) {
            setRange([start, end]);
            if (isDateEditing && chartRef.current) {
                chartRef.current.dispatchAction({
                    type: 'dataZoom',
                    startValue: start,
                    endValue: end
                });
            }
        }
    }, [startDate, endDate, isDateEditing]);

    const handleZoom = useCallback((e: any) => {
        const batch = (e?.batch && e.batch[0]) ? e.batch[0] : e || {};
        let { startValue, endValue, start, end } = batch;

        // Calculate values from percentages if needed
        if (startValue == null || endValue == null) {
            const spanAll = globalMax - globalMin;
            startValue = Math.round(globalMin + ((start ?? 0) / 100) * spanAll);
            endValue = Math.round(globalMin + ((end ?? 100) / 100) * spanAll);
        }

        // Snap to midnight if enabled
        if (snapMidnight) {
            startValue = dateUtils.stripTime(new Date(startValue)).getTime();
            endValue = dateUtils.stripTime(new Date(endValue)).getTime() + (DAY - 1);
        }

        setLiveSpan(Math.max(1, endValue - startValue));

        const startDay = dateUtils.stripTime(new Date(startValue)).getTime();
        const endDay = dateUtils.stripTime(new Date(endValue)).getTime() + (DAY - 1);

        // Debounced range update
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setRange([startDay, endDay]), DEBOUNCE_MS);

        // Update date inputs only when zoom comes from chart interaction, not date editing
        setStartDate(dateUtils.toInputValue(startDay));
        setEndDate(dateUtils.toInputValue(endDay));
    }, [globalMin, globalMax, snapMidnight]);

    const chartOption: EChartsOption = useMemo(() => {
        const span = liveSpan || (globalMax - globalMin);
        const minSpan = Math.max(DAY, Math.floor(span * 0.01));

        const xAxisConfig = {
            type: 'time' as const,
            minInterval: DAY,
            axisLabel: {
                hideOverlap: true,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: (val: number) => dateUtils.tickFormat(val, span)
            },
            axisTick: { alignWithLabel: true }
        };

        return {
            title: { text: 'OpenZiti Repos — Stars (Total & Daily)', left: 8, top: 2, padding: [0, 0, 6, 0] },
            legend: {
                top: 28, right: 8,
                data: [{ name: 'ziti' }, { name: 'zrok' }, { name: 'others' }, { name: 'TOTAL' }],
                selected: legendSelected,
                selectedMode: 'multiple'
            },
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            grid: [
                { left: 48, right: 16, top: 64, height: '48%', containLabel: true },
                { left: 54, right: 16, top: '66%', height: '24%', containLabel: true }
            ],
            xAxis: [{ ...xAxisConfig, gridIndex: 0 }, { ...xAxisConfig, gridIndex: 1 }],
            yAxis: [
                { type: 'value', name: 'Total Stars', gridIndex: 0, min: 'dataMin' },
                { type: 'value', name: 'Daily Stars', gridIndex: 1, min: 0 }
            ],
            color: [COLORS.ziti, COLORS.zrok, COLORS.others, COLORS.TOTAL],
            dataZoom: [
                { type: 'inside', xAxisIndex: [0, 1] },
                {
                    type: 'slider', xAxisIndex: [0, 1], height: 36, bottom: 52, showDetail: true,
                    handleSize: '140%', minValueSpan: minSpan, startValue: range?.[0], endValue: range?.[1],
                    borderRadius: 6, fillerColor: 'rgba(84,132,255,0.25)', handleStyle: { borderWidth: 1 }
                }
            ],
            series: [
                ...createSeriesPair('ziti', COLORS.ziti, processedData.ziti.daily, processedData.ziti.cumulative),
                ...createSeriesPair('zrok', COLORS.zrok, processedData.zrok.daily, processedData.zrok.cumulative),
                ...createSeriesPair('others', COLORS.others, processedData.others.daily, processedData.others.cumulative),
                {
                    id: 'TOTAL-line', name: 'TOTAL', xAxisIndex: 0, yAxisIndex: 0, type: 'line',
                    smooth: true, showSymbol: false, legendHoverLink: false,
                    itemStyle: { color: COLORS.TOTAL },
                    lineStyle: { color: COLORS.TOTAL, width: 2, type: 'dashed' },
                    data: processedData.total.cumulative
                },
                {
                    id: 'TOTAL-bar', name: 'TOTAL', xAxisIndex: 1, yAxisIndex: 1, type: 'bar',
                    legendHoverLink: false, itemStyle: { color: COLORS.TOTAL },
                    barWidth: '80%', // Fixed bar width for alignment
                    barMaxWidth: 20, // Prevent bars from getting too wide when zoomed in
                    data: processedData.total.daily
                }
            ]
        };
    }, [processedData, liveSpan, globalMin, globalMax, range, legendSelected]);

    const onEvents = useMemo(() => ({
        datazoom: handleZoom,
        dataZoom: handleZoom,
        legendselectchanged: (e: any) => {
            setLegendSelected(prev => ({ ...prev, [e.name]: e.selected[e.name] }));
        }
    }), [handleZoom]);

    const statsRows = useMemo(() => [
        { label: REPOS.ziti.label, color: REPOS.ziti.color, stats: calculateStats(REPOS.ziti.data, range) },
        { label: REPOS.zrok.label, color: REPOS.zrok.color, stats: calculateStats(REPOS.zrok.data, range) },
        { label: REPOS.others.label, color: REPOS.others.color, stats: calculateStats(REPOS.others.data, range) },
        {
            label: 'TOTAL',
            color: COLORS.TOTAL,
            stats: calculateStats([...REPOS.ziti.data, ...REPOS.zrok.data, ...REPOS.others.data], range)
        },
    ], [range]);

    const handleReady = useCallback((chart: ECharts) => {
        chartRef.current = chart;
    }, []);

    return (
        <NetFoundryLayout className={styles.landing} starProps={starProps} footerProps={openZitiFooter}>
            <ReactEcharts
                option={chartOption}
                style={{ width: '100%', height: CHART_HEIGHT }}
                onEvents={onEvents}
                onChartReady={handleReady}
            />
            <Controls
                snapMidnight={snapMidnight}
                setSnapMidnight={setSnapMidnight}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                setIsDateEditing={setIsDateEditing}
            />
            <StatsTable rows={statsRows} range={range} />
        </NetFoundryLayout>
    );
}