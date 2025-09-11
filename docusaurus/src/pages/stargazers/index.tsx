import React, {useMemo, useRef, useState, useCallback, useEffect, JSX} from 'react';
import ReactEcharts from 'echarts-for-react';
import type {ECharts, EChartsOption, SeriesOption} from 'echarts';

import ziti from './all.ziti.stargazers.json';
import zrok from './all.zrok.stargazers.json';
import others from './all.other.stargazers.json';
import styles from "../new-landing/styles.module.css";
import {NetFoundryLayout} from "@openclint/docusaurus-shared/ui";

import {starProps} from "@openziti/src/components/consts"
import {openZitiFooter} from "@openziti/src/components/footer";

type StarEvent = { date: string };
type Point = [number, number];
type Range = [number, number] | null;

const DAY = 86_400_000;
const YEAR = 365 * DAY;

const COLORS: Record<'ziti'|'zrok'|'others', string> = {
    ziti:   '#4F46E5',
    zrok:   '#10B981',
    others: '#F59E0B',
};

const stripTime = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const byDate = (a: StarEvent, b: StarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime();

const tickFormat = (ts: number, span: number) => {
    const d = new Date(ts);
    if (span > 2 * YEAR) return d.getMonth() === 0 && d.getDate() === 1 ? String(d.getFullYear()) : '';
    if (span > 90 * DAY) return d.getDate() === 1 ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : '';
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function dailyCounts(events: StarEvent[]): Point[] {
    const map = new Map<number, number>();
    for (const {date} of events) {
        const t = stripTime(new Date(date)).getTime();
        map.set(t, (map.get(t) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]) as Point[];
}
function cumulative(events: StarEvent[]): Point[] {
    const out: Point[] = []; let n = 0;
    for (const {date} of [...events].sort(byDate)) { n += 1; out.push([new Date(date).getTime(), n]); }
    return out;
}
function statsInRange(events: StarEvent[], range: Range) {
    if (!events.length) return null;
    const times = events.map(e => stripTime(new Date(e.date)).getTime()).sort((a,b)=>a-b);
    const [minT, maxT] = range ?? [times[0], times[times.length-1]];
    const inWin = times.filter(t => t >= minT && t <= maxT);
    if (!inWin.length) return {stars:0, days:0, avgPerDay:0, daysWithStars:0, maxInOneDay:0, dayWithMost:'—'};
    const first = inWin[0], last = inWin[inWin.length-1];
    const numDays = Math.max(1, Math.floor((last - first) / DAY) + 1);
    const dayMap = new Map<number, number>();
    for (const t of inWin) dayMap.set(t, (dayMap.get(t) ?? 0) + 1);
    let maxDay = first, maxCount = 0;
    for (const [t,c] of dayMap) if (c > maxCount) { maxCount = c; maxDay = t; }
    return {
        stars: inWin.length,
        days: numDays,
        avgPerDay: +(inWin.length / numDays).toFixed(3),
        daysWithStars: dayMap.size,
        maxInOneDay: maxCount,
        dayWithMost: new Date(maxDay).toISOString().slice(0,10),
    };
}

const seriesPair = (name: 'ziti'|'zrok'|'others', color: string, daily: Point[], total: Point[]): SeriesOption[] => ([
    {
        name, // legend toggles BOTH (same name)
        xAxisIndex: 0, yAxisIndex: 0,
        type: 'line', smooth: true, showSymbol: false,
        itemStyle: { color },
        lineStyle: { color, width: 2 },
        areaStyle: { color: color + '22' },
        data: total,
    },
    {
        name, // same name to link legend
        xAxisIndex: 1, yAxisIndex: 1,
        type: 'bar',
        itemStyle: { color },
        data: daily,
    },
]);

function Pill({label, color}:{label:string;color:string}) {
    return <span style={{background: color, color:'#fff', padding:'2px 8px', borderRadius:999}}>{label}</span>;
}

function StatsTable({rows, range}:{rows:{label:string;color:string;s:any}[]; range:Range}) {
    const formatDate = (t:number) => new Date(t).toISOString().slice(0,10);

    return (
        <div style={{margin:'8px 0 12px', border:'1px solid var(--ifm-table-border-color, #e3e3e3)', borderRadius:8, padding:12}}>
            {range && (
                <div style={{marginBottom:8, fontWeight:600}}>
                    Date range: {formatDate(range[0])} → {formatDate(range[1])}
                </div>
            )}
            <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
                <thead>
                <tr>
                    <th style={{textAlign:'left'}}>Repo</th>
                    <th>Number of stars</th>
                    <th>Number of days</th>
                    <th>Average stars per day</th>
                    <th>Days with stars</th>
                    <th>Max stars in one day</th>
                    <th>Day with most stars</th>
                </tr>
                </thead>
                <tbody>
                {rows.map(({label, color, s}) => (
                    <tr key={label}>
                        <td><span style={{background:color, color:'#fff', padding:'2px 8px', borderRadius:999}}>{label}</span></td>
                        <td style={{textAlign:'center'}}>{s?.stars?.toLocaleString?.() ?? 0}</td>
                        <td style={{textAlign:'center'}}>{s?.days?.toLocaleString?.() ?? 0}</td>
                        <td style={{textAlign:'center'}}>{s?.avgPerDay ?? 0}</td>
                        <td style={{textAlign:'center'}}>{s?.daysWithStars?.toLocaleString?.() ?? 0}</td>
                        <td style={{textAlign:'center'}}>{s?.maxInOneDay ?? 0}</td>
                        <td style={{textAlign:'center'}}>{s?.dayWithMost ?? '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}


export default function Stargazers(): JSX.Element {
    const chartRef = useRef<ECharts|null>(null);
    const [range, setRange] = useState<Range>(null);      // debounced → table
    const [liveSpan, setLiveSpan] = useState<number>(0);  // immediate → ticks
    const pendingRange = useRef<Range>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const zitiDaily = useMemo(()=>dailyCounts(ziti as StarEvent[]), []);
    const zrokDaily = useMemo(()=>dailyCounts(zrok as StarEvent[]), []);
    const othersDaily = useMemo(()=>dailyCounts(others as StarEvent[]), []);
    const zitiTotal = useMemo(()=>cumulative(ziti as StarEvent[]), []);
    const zrokTotal = useMemo(()=>cumulative(zrok as StarEvent[]), []);
    const othersTotal = useMemo(()=>cumulative(others as StarEvent[]), []);

    const globalMin = useMemo(()=>Math.min(...[...zitiTotal, ...zrokTotal, ...othersTotal].map(p=>p[0])), [zitiTotal, zrokTotal, othersTotal]);
    const globalMax = useMemo(()=>Math.max(...[...zitiTotal, ...zrokTotal, ...othersTotal].map(p=>p[0])), [zitiTotal, zrokTotal, othersTotal]);

    useEffect(() => {
        if (!Number.isFinite(globalMin) || !Number.isFinite(globalMax)) return;
        setRange([stripTime(new Date(globalMin)).getTime(), stripTime(new Date(globalMax)).getTime()]);
        setLiveSpan(globalMax - globalMin);
    }, [globalMin, globalMax]);

    const option: EChartsOption = useMemo(() => {
        const span = liveSpan || (globalMax - globalMin);
        const xCommon = {
            type: 'time',
            minInterval: DAY,
            axisLabel: {
                hideOverlap: true,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: (val: number) => tickFormat(+val, span),
            },
            axisTick: { alignWithLabel: true },
            splitLine: {
                show: true,
                lineStyle: { opacity: 0.25 },
                interval: (_: number, value: any) => {
                    const d = new Date(+value);
                    return span > 2 * YEAR
                        ? d.getMonth() === 0 && d.getDate() === 1
                        : span > 90 * DAY
                            ? d.getDate() === 1
                            : true;
                },
            },
        } as const;

        return {
            title: {text: 'OpenZiti Repos — Stars (Total & Daily)', left: 8, top: 2, padding: [0,0,6,0]},
            legend: {
                top: 28, right: 8,
                data: ['ziti', 'zrok', 'others'],
                selectedMode: 'multiple'
            },
            tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
            grid: [
                {left: 48, right: 16, top: 64, height: '48%', containLabel: true},
                {left: 48, right: 16, top: '66%', height: '24%', containLabel: true},
            ],
            xAxis: [{ ...xCommon, gridIndex: 0 }, { ...xCommon, gridIndex: 1 }],
            yAxis: [
                {type:'value', name:'Total Stars', gridIndex:0, min:'dataMin'},
                {type:'value', name:'Daily Stars', gridIndex:1, min:0},
            ],
            // palette not strictly required since we set per-series colors, but keep for legend swatches
            color: [COLORS.ziti, COLORS.zrok, COLORS.others],
            dataZoom: [
                { type:'inside', xAxisIndex:[0,1], zoomOnMouseWheel:true, moveOnMouseMove:true, moveOnMouseWheel:false },
                { type:'slider', xAxisIndex:[0,1], height:36, bottom:12, showDetail:true, handleSize:'140%', minValueSpan:30*DAY,
                    borderRadius:6, fillerColor:'rgba(84,132,255,0.25)', handleStyle:{borderWidth:1} },
            ],
            series: [
                ...seriesPair('ziti',   COLORS.ziti,   zitiDaily,   zitiTotal),
                ...seriesPair('zrok',   COLORS.zrok,   zrokDaily,   zrokTotal),
                ...seriesPair('others', COLORS.others, othersDaily, othersTotal),
            ],
        };
    }, [zitiDaily, zrokDaily, othersDaily, zitiTotal, zrokTotal, othersTotal, liveSpan, globalMin, globalMax]);

    const onReady = useCallback((c:ECharts) => {
        if (chartRef.current) return;
        chartRef.current = c;
        const dom = c.getDom() as HTMLDivElement;
        dom.style.cursor = 'grab';
        const zr = c.getZr();
        zr.on('mousedown', () => { dom.style.cursor = 'grabbing'; });
        zr.on('mouseup',   () => { dom.style.cursor = 'grab'; });
        zr.on('globalout', () => { dom.style.cursor = 'grab'; });
    }, []);

    const handleZoom = useCallback((e:any) => {
        const b = (e?.batch && e.batch[0]) ? e.batch[0] : e || {};
        let { startValue, endValue, start, end } = b;
        if (startValue == null || endValue == null) {
            const spanAll = globalMax - globalMin;
            startValue = Math.round(globalMin + ((start ?? 0) / 100) * spanAll);
            endValue   = Math.round(globalMin + ((end ?? 100) / 100) * spanAll);
        }
        // ticks update immediately
        setLiveSpan(Math.max(1, endValue - startValue));
        // table updates after debounce
        const sDay = stripTime(new Date(startValue)).getTime();
        const eDayInclusive = stripTime(new Date(endValue)).getTime() + (DAY - 1);
        pendingRange.current = [sDay, eDayInclusive];
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setRange(pendingRange.current), 500);
    }, [globalMin, globalMax]);

    const onEvents = useMemo(() => ({
        datazoom: handleZoom,
        dataZoom: handleZoom,
    }), [handleZoom]);

    const rows = useMemo(() => ([
        {label:'openziti / ziti',   color: COLORS.ziti,   s: statsInRange(ziti as StarEvent[], range)},
        {label:'openziti / zrok',   color: COLORS.zrok,   s: statsInRange(zrok as StarEvent[], range)},
        {label:'openziti / others', color: COLORS.others, s: statsInRange(others as StarEvent[], range)},
    ]), [range]);

    return (
        <NetFoundryLayout className={styles.landing} starProps={starProps} footerProps={openZitiFooter}>
            <ReactEcharts option={option} style={{width:'100%', height: 620}} onChartReady={onReady} onEvents={onEvents}/>
            <StatsTable rows={rows} range={range} />
        </NetFoundryLayout>
    );
}
