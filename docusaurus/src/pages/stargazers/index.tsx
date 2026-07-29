import React, {
    useMemo, useRef, useState, useCallback, useEffect, JSX
} from 'react';
import ReactEcharts from 'echarts-for-react';
import type {ECharts, EChartsOption, SeriesOption} from 'echarts';

import repoStars from './all.repos.stargazers.json';
import styles from "../new-landing/styles.module.css";
import css from './styles.module.css';
import {NetFoundryLayout} from "@netfoundry/docusaurus-theme/ui";
import {starProps} from "@openziti/src/components/consts"
import {openZitiFooter} from "@openziti/src/components/footer";

/* ------------------ Types & Constants ------------------ */
type Point = [number, number];
type DateRange = [number, number];
type Series = { key: string; label: string; color: string; dates: number[] };

const DAY = 86_400_000;
const YEAR = 365 * DAY;
const CHART_HEIGHT = 620;
const DEBOUNCE_MS = 200;
const ORG = 'openziti';
const STORAGE_KEY = 'openziti.stargazers.v1';

const OTHER_KEY = '__other__';
const TOTAL_KEY = '__total__';
const OTHER_COLOR = '#F59E0B';
const TOTAL_COLOR = '#111827';

// Assigned to picked repos in pick order, so a repo keeps its color as long as
// the selection above it doesn't change.
const PALETTE = [
    '#4F46E5', '#10B981', '#EF4444', '#0EA5E9', '#A855F7', '#F97316',
    '#14B8A6', '#EC4899', '#84CC16', '#6366F1', '#F43F5E', '#06B6D4',
];

const DEFAULT_SELECTION = ['ziti', 'zrok'];

/** Preset windows for the range buttons. null months = everything. */
const PRESETS: Array<{ label: string; months: number | null }> = [
    {label: '1M', months: 1},
    {label: '3M', months: 3},
    {label: '6M', months: 6},
    {label: '1Y', months: 12},
    {label: '2Y', months: 24},
    {label: 'All', months: null},
];

/* ------------------ Source data ------------------ */
/** {repo: [ISO date, ...]} straight from gh-stats.sh, parsed to epoch ms once. */
const RAW: Record<string, string[]> = repoStars as Record<string, string[]>;

type RepoInfo = { name: string; dates: number[]; count: number; first: number; last: number };

const ALL_REPOS: RepoInfo[] = Object.entries(RAW)
    .map(([name, dates]) => {
        const ms = dates.map(d => new Date(d).getTime()).sort((a, b) => a - b);
        return {name, dates: ms, count: ms.length, first: ms[0], last: ms[ms.length - 1]};
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

const REPO_BY_NAME = new Map(ALL_REPOS.map(r => [r.name, r]));

const ALL_DATES: number[] = ALL_REPOS
    .flatMap(r => r.dates)
    .sort((a, b) => a - b);

const DATA_MIN = stripTime(ALL_DATES[0]);
const DATA_MAX = stripTime(ALL_DATES[ALL_DATES.length - 1]);

/* ------------------ Date Utilities ------------------ */
function stripTime(ms: number): number {
    const d = new Date(ms);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const dateUtils = {
    /** yyyy-mm-dd, the value shape of <input type="date"> */
    toInputValue: (ms: number): string => new Date(ms).toISOString().slice(0, 10),

    fromInputValue: (val: string): number => {
        if (!val) return NaN;
        const [y, m, d] = val.split('-').map(Number);
        if (!y || !m || !d) return NaN;
        return Date.UTC(y, m - 1, d);
    },

    formatDisplay: (ms: number): string => new Date(ms).toISOString().slice(0, 10),

    /** Subtract whole months from an epoch ms, UTC. */
    minusMonths: (ms: number, months: number): number => {
        const d = new Date(ms);
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - months, d.getUTCDate());
    },

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

/* ------------------ Persisted settings ------------------ */
type Settings = {
    selected: string[];
    showOther: boolean;
    showTotal: boolean;
    range: DateRange | null;
};

const DEFAULT_SETTINGS: Settings = {
    selected: DEFAULT_SELECTION.filter(r => REPO_BY_NAME.has(r)),
    showOther: true,
    showTotal: false,
    range: null,
};

/**
 * localStorage, guarded for SSR (this module is evaluated during the Docusaurus
 * build, where `window` doesn't exist). Unknown repo names are dropped so a
 * saved selection survives a repo being renamed or losing all its stars.
 */
function loadSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const saved = JSON.parse(raw) as Partial<Settings>;
        const selected = Array.isArray(saved.selected)
            ? saved.selected.filter(r => REPO_BY_NAME.has(r))
            : DEFAULT_SETTINGS.selected;
        let range: DateRange | null = null;
        if (Array.isArray(saved.range) && saved.range.length === 2
            && saved.range.every(n => Number.isFinite(n))) {
            // Clamp to the data we actually have -- saved ranges outlive rebuilds.
            const start = Math.max(DATA_MIN, Math.min(saved.range[0], DATA_MAX));
            const end = Math.max(start + DAY, Math.min(saved.range[1], DATA_MAX));
            range = [start, end];
        }
        return {
            selected,
            showOther: saved.showOther ?? DEFAULT_SETTINGS.showOther,
            showTotal: saved.showTotal ?? DEFAULT_SETTINGS.showTotal,
            range,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(s: Settings): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
        /* private mode / quota -- settings just don't persist */
    }
}

/* ------------------ Data Processing ------------------ */
/** Sorted epoch-ms list -> per-day counts + cumulative running total. */
function processStarData(dates: number[]) {
    const dailyMap = new Map<number, number>();
    for (const ms of dates) {
        const t = stripTime(ms);
        dailyMap.set(t, (dailyMap.get(t) || 0) + 1);
    }

    const cumulative: Point[] = [];
    let count = 0;
    for (const ms of dates) {
        count++;
        cumulative.push([ms, count]);
    }
    return {dailyMap, cumulative};
}

/**
 * ECharts only stacks bars that share an x value, so every daily series has to
 * carry the same day list -- zero-filled where a repo got no stars that day.
 * Without this the stacked bars would silently overlap instead of adding up.
 */
function alignDaily(maps: Array<Map<number, number>>): Point[][] {
    const days = new Set<number>();
    for (const m of maps) for (const d of m.keys()) days.add(d);
    const axis = Array.from(days).sort((a, b) => a - b);
    return maps.map(m => axis.map(d => [d, m.get(d) ?? 0] as Point));
}

function mergeSorted(lists: number[][]): number[] {
    return lists.flat().sort((a, b) => a - b);
}

function calculateStats(dates: number[], range: DateRange) {
    if (!dates.length) return null;

    const [minT, maxT] = range;
    const inWindow: number[] = [];
    for (const ms of dates) {
        const t = stripTime(ms);
        if (t >= minT && t <= maxT) inWindow.push(t);
    }

    if (!inWindow.length) {
        return {stars: 0, avgPerDay: 0, daysWithStars: 0, maxInOneDay: 0, dayWithMost: '—'};
    }

    const first = inWindow[0];
    const effectiveStart = Math.max(minT, first); // Later of: range start OR first star
    const numDays = Math.max(1, Math.floor((maxT - effectiveStart) / DAY) + 1);

    const dayMap = new Map<number, number>();
    for (const t of inWindow) dayMap.set(t, (dayMap.get(t) || 0) + 1);

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
        avgPerDay: +(inWindow.length / numDays).toFixed(3),
        daysWithStars: dayMap.size,
        maxInOneDay: maxCount,
        dayWithMost: dateUtils.formatDisplay(maxDay),
    };
}

/**
 * Two series per line: the cumulative curve on the top grid, the daily count on
 * the bottom one. TOTAL is the sum of every other series, so it gets no daily
 * bar -- the stacked bars already add up to it -- and no fill, just a dashed
 * line, so it reads as an envelope rather than another repo.
 */
function createSeriesPair(s: Series, daily: Point[], cumulative: Point[]): SeriesOption[] {
    const {label, color} = s;
    const isTotal = s.key === TOTAL_KEY;

    const line: SeriesOption = {
        id: `${s.key}-line`, name: label, xAxisIndex: 0, yAxisIndex: 0, type: 'line',
        smooth: true, showSymbol: false,
        itemStyle: {color},
        lineStyle: {color, width: 2, type: isTotal ? 'dashed' : 'solid'},
        data: cumulative,
        ...(isTotal ? {legendHoverLink: false} : {areaStyle: {color: color + '22'}}),
    };
    if (isTotal) return [line];

    return [line, {
        id: `${s.key}-bar`, name: label, xAxisIndex: 1, yAxisIndex: 1, type: 'bar',
        // The picked repos and "other" are disjoint, so stacking them makes the
        // bottom chart read as the org's daily total, broken down by repo.
        stack: 'daily', barMaxWidth: 24,
        itemStyle: {color}, data: daily
    }];
}

/* ------------------ UI Components ------------------ */
/** Everything but the palette colors lives in the CSS module. */
const btnClass = (active = false) => active ? `${css.btn} ${css.btnActive}` : css.btn;

interface RepoPickerProps {
    selected: string[];
    toggle: (repo: string) => void;
    setSelected: (repos: string[]) => void;
    colorOf: (repo: string) => string | null;
}

/**
 * The repo chooser. Any org repo can get its own line; whatever is left over is
 * what "other" means, so the two always add up to the whole org.
 */
function RepoPicker({selected, toggle, setSelected, colorOf}: RepoPickerProps) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');

    const visible = useMemo(() => {
        const q = filter.trim().toLowerCase();
        return q ? ALL_REPOS.filter(r => r.name.toLowerCase().includes(q)) : ALL_REPOS;
    }, [filter]);

    const topN = (n: number) => setSelected(ALL_REPOS.slice(0, n).map(r => r.name));

    return (
        <div className={css.card}>
            <div className={css.pickerHeader}>
                <span className={css.pickerTitle}>Charted repos ({selected.length})</span>
                {selected.map(name => (
                    <span key={name} className={css.chip} style={{background: colorOf(name) || '#888'}}>
                        {name}
                        <button
                            className={css.chipRemove}
                            onClick={() => toggle(name)}
                            title={`Remove ${name} from the chart`}
                        >×</button>
                    </span>
                ))}
                {!selected.length && (
                    <span className={css.pickerEmpty}>none — everything is in “other”</span>
                )}
                <span className={css.spacer}/>
                <button className={btnClass(open)} onClick={() => setOpen(o => !o)}>
                    {open ? 'Hide repos ▲' : 'Pick repos ▼'}
                </button>
            </div>

            {open && (
                <div>
                    <div className={css.pickerTools}>
                        <input
                            className={css.filter}
                            type="search"
                            placeholder="filter repos…"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                        <button className={css.btn} onClick={() => topN(2)}>Top 2</button>
                        <button className={css.btn} onClick={() => topN(5)}>Top 5</button>
                        <button className={css.btn} onClick={() => topN(10)}>Top 10</button>
                        <button className={css.btn} onClick={() => setSelected([])}>Clear</button>
                        <span className={css.pickerNote}>
                            {ALL_REPOS.length} repos with stars · {PALETTE.length} distinct colors
                        </span>
                    </div>
                    <div className={css.repoGrid}>
                        {visible.map(r => {
                            const on = selected.includes(r.name);
                            const color = colorOf(r.name);
                            return (
                                <label key={r.name} className={css.repoRow} title={r.name}>
                                    <input
                                        className={css.check} type="checkbox"
                                        checked={on} onChange={() => toggle(r.name)}
                                    />
                                    <span
                                        className={css.swatch}
                                        style={on ? {background: color || '#888', borderColor: 'transparent'} : undefined}
                                    />
                                    <span className={css.repoName}>{r.name}</span>
                                    <span className={css.repoCount}>{r.count}</span>
                                </label>
                            );
                        })}
                        {!visible.length && <span className={css.pickerEmpty}>no match</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

interface RangeControlsProps {
    range: DateRange;
    applyRange: (r: DateRange) => void;
    showOther: boolean;
    setShowOther: (v: boolean) => void;
    showTotal: boolean;
    setShowTotal: (v: boolean) => void;
    onReset: () => void;
}

function RangeControls({
                           range, applyRange, showOther, setShowOther,
                           showTotal, setShowTotal, onReset
                       }: RangeControlsProps) {
    const preset = (months: number | null) => {
        if (months == null) return applyRange([DATA_MIN, DATA_MAX]);
        applyRange([Math.max(DATA_MIN, dateUtils.minusMonths(DATA_MAX, months)), DATA_MAX]);
    };

    const setStart = (val: string) => {
        const t = dateUtils.fromInputValue(val);
        if (Number.isFinite(t) && t < range[1]) applyRange([t, range[1]]);
    };
    const setEnd = (val: string) => {
        const t = dateUtils.fromInputValue(val);
        if (Number.isFinite(t) && t > range[0]) applyRange([range[0], t]);
    };

    return (
        <div className={css.controls}>
            <div className={css.presets}>
                {PRESETS.map(p => (
                    <button key={p.label} className={css.btn} onClick={() => preset(p.months)}>{p.label}</button>
                ))}
            </div>
            <label className={css.field}>
                Start:
                <input
                    type="date" value={dateUtils.toInputValue(range[0])}
                    min={dateUtils.toInputValue(DATA_MIN)} max={dateUtils.toInputValue(DATA_MAX)}
                    onChange={e => setStart(e.target.value)}
                />
            </label>
            <label className={css.field}>
                End:
                <input
                    type="date" value={dateUtils.toInputValue(range[1])}
                    min={dateUtils.toInputValue(DATA_MIN)} max={dateUtils.toInputValue(DATA_MAX)}
                    onChange={e => setEnd(e.target.value)}
                />
            </label>
            <label className={css.field}>
                <input
                    className={css.check} type="checkbox"
                    checked={showOther} onChange={e => setShowOther(e.target.checked)}
                />
                Show “other”
            </label>
            <label className={css.field}>
                <input
                    className={css.check} type="checkbox"
                    checked={showTotal} onChange={e => setShowTotal(e.target.checked)}
                />
                Show org total
            </label>
            <span className={css.spacer}/>
            <button className={css.btn} onClick={onReset} title="Back to the default repos and full date range">
                Reset
            </button>
        </div>
    );
}

type StatsRow = { label: string; color: string; stats: ReturnType<typeof calculateStats> };

/**
 * Sortable columns. `num` columns compare as numbers and default to descending;
 * the rest compare as strings and default to ascending. Peak day sorts on its
 * yyyy-mm-dd text (lexicographic order is chronological); an empty window's '—'
 * normalizes to '' so blanks group together instead of sorting by em-dash.
 *
 * Note the counts are strongly correlated -- stars, avg/day and max/day usually
 * produce the same descending order -- so switching between them can leave the
 * rows visibly unmoved. That's why the active column is highlighted, not just
 * arrowed: without it, a correct sort reads as a click that did nothing.
 */
const STAT_COLUMNS: Array<{
    key: string;
    label: string;
    num: boolean;
    value: (r: StatsRow) => number | string;
}> = [
    {key: 'repo', label: 'Repo', num: false, value: r => r.label.toLowerCase()},
    {key: 'stars', label: 'Stars', num: true, value: r => r.stats?.stars ?? 0},
    {key: 'avg', label: 'Avg/day', num: true, value: r => r.stats?.avgPerDay ?? 0},
    {key: 'days', label: 'Days w/ stars', num: true, value: r => r.stats?.daysWithStars ?? 0},
    {key: 'max', label: 'Max/day', num: true, value: r => r.stats?.maxInOneDay ?? 0},
    {key: 'peak', label: 'Peak day', num: false, value: r => (r.stats?.dayWithMost ?? '').replace('—', '')},
];

interface StatsTableProps {
    rows: StatsRow[];
    range: DateRange;
}

function StatsTable({rows, range}: StatsTableProps) {
    // Stars, biggest first -- the question the table is usually answering.
    const [sort, setSort] = useState<{ key: string; asc: boolean }>({key: 'stars', asc: false});

    const clickHeader = (col: typeof STAT_COLUMNS[number]) => {
        setSort(prev => prev.key === col.key
            ? {key: col.key, asc: !prev.asc}
            // First click on a column: counts start high-to-low, text A-to-Z.
            : {key: col.key, asc: !col.num});
    };

    const sorted = useMemo(() => {
        const col = STAT_COLUMNS.find(c => c.key === sort.key) ?? STAT_COLUMNS[1];
        const dir = sort.asc ? 1 : -1;
        // TOTAL is an aggregate of the other rows, so it stays pinned at the
        // bottom instead of winning every descending sort.
        const totals = rows.filter(r => r.label.startsWith('TOTAL'));
        const rest = rows.filter(r => !r.label.startsWith('TOTAL'));
        return [
            ...rest.sort((a, b) => {
                const av = col.value(a), bv = col.value(b);
                const cmp = col.num
                    ? (av as number) - (bv as number)
                    : String(av).localeCompare(String(bv));
                // Ties fall back to repo name, in the same direction, so the
                // order is total and flipping direction reverses it exactly.
                return (cmp || a.label.localeCompare(b.label)) * dir;
            }),
            ...totals,
        ];
    }, [rows, sort]);

    return (
        <div className={css.card}>
            <div className={css.rangeLabel}>
                Date range: {dateUtils.formatDisplay(range[0])} → {dateUtils.formatDisplay(range[1])}
            </div>
            <div className={css.statsWrap}>
                <table className={css.stats}>
                    <thead>
                    <tr>
                        {STAT_COLUMNS.map(col => {
                            const active = sort.key === col.key;
                            return (
                                <th
                                    key={col.key}
                                    className={active ? `${css.sortable} ${css.sortActive}` : css.sortable}
                                    aria-sort={active ? (sort.asc ? 'ascending' : 'descending') : 'none'}
                                    onClick={() => clickHeader(col)}
                                    title={`Sort by ${col.label}`}
                                >
                                    {col.label}
                                    <span className={css.sortArrow}>{active ? (sort.asc ? '▲' : '▼') : '↕'}</span>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map(({label, color, stats}) => {
                        // Tint the sorted column's cells too. Because the counts
                        // correlate, re-sorting often doesn't move any rows --
                        // the tint is what tells you the click registered.
                        const cell = (key: string) => sort.key === key ? css.sortedCell : undefined;
                        return (
                            <tr key={label}>
                                <td className={cell('repo')}>
                                    <span className={css.chip} style={{background: color}}>{label}</span>
                                </td>
                                <td className={cell('stars')}>{stats?.stars ?? 0}</td>
                                <td className={cell('avg')}>{stats?.avgPerDay ?? 0}</td>
                                <td className={cell('days')}>{stats?.daysWithStars ?? 0}</td>
                                <td className={cell('max')}>{stats?.maxInOneDay ?? 0}</td>
                                <td className={cell('peak')}>{stats?.dayWithMost ?? '—'}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ------------------ Main Component ------------------ */
export default function Stargazers(): JSX.Element {
    const chartRef = useRef<ECharts | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Read by the axis formatter on every echarts repaint. Kept in a ref, not
    // state, so panning the slider doesn't rebuild the whole chart option --
    // that rebuild was what made the old slider feel like it was dragging mud.
    const spanRef = useRef<number>(DATA_MAX - DATA_MIN);

    const [selected, setSelected] = useState<string[]>(DEFAULT_SETTINGS.selected);
    const [showOther, setShowOther] = useState(DEFAULT_SETTINGS.showOther);
    const [showTotal, setShowTotal] = useState(DEFAULT_SETTINGS.showTotal);
    const [range, setRange] = useState<DateRange>([DATA_MIN, DATA_MAX]);
    const [hydrated, setHydrated] = useState(false);
    // Mirrors `range` for effects that must not re-run when it changes.
    const rangeRef = useRef<DateRange>([DATA_MIN, DATA_MAX]);
    rangeRef.current = range;

    // Restore saved settings after mount (SSR renders the defaults).
    useEffect(() => {
        const s = loadSettings();
        setSelected(s.selected);
        setShowOther(s.showOther);
        setShowTotal(s.showTotal);
        if (s.range) {
            setRange(s.range);
            spanRef.current = s.range[1] - s.range[0];
        }
        setHydrated(true);
    }, []);

    // Persist on change. `hydrated` is state, not a ref, so this can't fire
    // until the restore above has been committed -- a ref would let the first
    // render's defaults overwrite what the user saved.
    useEffect(() => {
        if (!hydrated) return;
        saveSettings({selected, showOther, showTotal, range});
    }, [hydrated, selected, showOther, showTotal, range]);

    const toggleRepo = useCallback((repo: string) => {
        setSelected(prev => prev.includes(repo) ? prev.filter(r => r !== repo) : [...prev, repo]);
    }, []);

    /** Move the window: updates state AND drives the chart's zoom to match. */
    const applyRange = useCallback((r: DateRange) => {
        const start = Math.max(DATA_MIN, Math.min(r[0], DATA_MAX));
        const end = Math.max(start + DAY, Math.min(r[1], DATA_MAX));
        spanRef.current = end - start;
        setRange([start, end]);
        chartRef.current?.dispatchAction({
            type: 'dataZoom', dataZoomIndex: 0, startValue: start, endValue: end,
        });
    }, []);

    const handleReset = useCallback(() => {
        setSelected(DEFAULT_SETTINGS.selected);
        setShowOther(DEFAULT_SETTINGS.showOther);
        setShowTotal(DEFAULT_SETTINGS.showTotal);
        applyRange([DATA_MIN, DATA_MAX]);
    }, [applyRange]);

    /** Every line the chart draws: the picked repos, then "other", then TOTAL. */
    const seriesList = useMemo<Series[]>(() => {
        const picked = selected
            .filter(name => REPO_BY_NAME.has(name))
            .map((name, i) => ({
                key: name,
                label: `${ORG} / ${name}`,
                color: PALETTE[i % PALETTE.length],
                dates: REPO_BY_NAME.get(name)!.dates,
            }));

        const list: Series[] = [...picked];

        const rest = ALL_REPOS.filter(r => !selected.includes(r.name));
        if (showOther && rest.length) {
            list.push({
                key: OTHER_KEY,
                label: `other (${rest.length} repo${rest.length === 1 ? '' : 's'})`,
                color: OTHER_COLOR,
                dates: mergeSorted(rest.map(r => r.dates)),
            });
        }
        if (showTotal) {
            list.push({
                key: TOTAL_KEY,
                label: `TOTAL (${ALL_REPOS.length} repos)`,
                color: TOTAL_COLOR,
                dates: ALL_DATES,
            });
        }
        return list;
    }, [selected, showOther, showTotal]);

    /** Chart color for a repo, or null if it isn't charted individually. */
    const colorOf = useCallback(
        (repo: string) => seriesList.find(s => s.key === repo)?.color ?? null,
        [seriesList]
    );

    const processed = useMemo(() => {
        const parts = seriesList.map(s => ({s, ...processStarData(s.dates)}));
        // TOTAL draws no bar, so it stays out of the shared day axis.
        const stacked = parts.filter(p => p.s.key !== TOTAL_KEY);
        const aligned = alignDaily(stacked.map(p => p.dailyMap));
        const dailyByKey = new Map(stacked.map((p, i) => [p.s.key, aligned[i]]));
        return parts.map(p => ({
            s: p.s,
            cumulative: p.cumulative,
            daily: dailyByKey.get(p.s.key) ?? [],
        }));
    }, [seriesList]);

    /**
     * Zoom coming *from* the chart (slider drag, scroll, brush). Snaps to whole
     * UTC days -- every stat is day-bucketed, so a sub-day window would show
     * numbers that don't match the axis. The state update is debounced; the
     * chart itself has already repainted, so nothing here blocks the drag.
     */
    const handleZoom = useCallback((e: any) => {
        const batch = (e?.batch && e.batch[0]) ? e.batch[0] : e || {};
        let {startValue, endValue, start, end} = batch;

        if (startValue == null || endValue == null) {
            const spanAll = DATA_MAX - DATA_MIN;
            startValue = Math.round(DATA_MIN + ((start ?? 0) / 100) * spanAll);
            endValue = Math.round(DATA_MIN + ((end ?? 100) / 100) * spanAll);
        }

        const startDay = stripTime(startValue);
        const endDay = stripTime(endValue);
        spanRef.current = Math.max(DAY, endDay - startDay);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setRange([startDay, endDay]), DEBOUNCE_MS);
    }, []);

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    /**
     * The chart option. Deliberately depends only on the series -- not on the
     * range or the live span -- so dragging never re-renders it. The zoom window
     * is pushed in imperatively (applyRange / the onChartReady restore) instead.
     */
    const chartOption: EChartsOption = useMemo(() => {
        const xAxisConfig = {
            type: 'time' as const,
            minInterval: DAY,
            axisLabel: {
                hideOverlap: true,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: (val: number) => dateUtils.tickFormat(val, spanRef.current)
            },
        };

        return {
            animation: false,
            title: {
                text: 'OpenZiti Repos — Stars (Total & Daily)',
                left: 8, top: 2, padding: [0, 0, 6, 0]
            },
            legend: {
                type: 'scroll' as const, top: 26, right: 8, left: 260,
                data: seriesList.map(s => s.label),
                selectedMode: 'multiple' as const
            },
            tooltip: {
                trigger: 'axis' as const,
                axisPointer: {type: 'cross' as const},
                order: 'valueDesc' as const
            },
            grid: [
                {left: 48, right: 16, top: 74, height: '46%', containLabel: true},
                {left: 54, right: 16, top: '66%', height: '22%', containLabel: true}
            ],
            xAxis: [{...xAxisConfig, gridIndex: 0}, {...xAxisConfig, gridIndex: 1}],
            yAxis: [
                {type: 'value' as const, name: 'Total Stars', gridIndex: 0, min: 'dataMin' as const},
                {type: 'value' as const, name: 'Daily Stars', gridIndex: 1, min: 0}
            ],
            color: seriesList.map(s => s.color),
            dataZoom: [
                {
                    type: 'slider' as const, xAxisIndex: [0, 1], height: 42, bottom: 46,
                    showDetail: true, showDataShadow: true,
                    // A whole day. The old chart derived this from the live span,
                    // so the floor moved while you dragged and the handle fought
                    // back near the end of a zoom-in.
                    minValueSpan: DAY,
                    labelFormatter: (v: number) => dateUtils.formatDisplay(v),
                    borderRadius: 6, fillerColor: 'rgba(84,132,255,0.22)',
                    handleSize: 22, handleStyle: {borderWidth: 1},
                    brushSelect: false,   // drag inside the slider pans, it doesn't re-brush
                    moveHandleSize: 8,
                },
                {
                    type: 'inside' as const, xAxisIndex: [0, 1], throttle: 50,
                    zoomOnMouseWheel: 'shift' as const
                },
            ],
            series: processed.flatMap(p => createSeriesPair(p.s, p.daily, p.cumulative)),
        };
    }, [seriesList, processed]);

    const onEvents = useMemo(() => ({
        datazoom: handleZoom,
        dataZoom: handleZoom,
    }), [handleZoom]);

    const statsRows = useMemo(
        () => seriesList.map(s => ({
            label: s.label, color: s.color, stats: calculateStats(s.dates, range)
        })),
        [seriesList, range]
    );

    const handleReady = useCallback((chart: ECharts) => {
        chartRef.current = chart;
    }, []);

    /**
     * Re-assert the window whenever the option is rebuilt (a repo added/removed
     * replaces the series wholesale, which resets the zoom to full) and once the
     * saved settings land. Reads the range from a ref so a mid-drag debounce
     * can't retrigger this and yank the handle out from under the cursor.
     */
    useEffect(() => {
        const [start, end] = rangeRef.current;
        if (start === DATA_MIN && end === DATA_MAX) return;
        chartRef.current?.dispatchAction({
            type: 'dataZoom', dataZoomIndex: 0, startValue: start, endValue: end,
        });
    }, [chartOption, hydrated]);

    return (
        <NetFoundryLayout className={styles.landing} starProps={starProps} footerProps={openZitiFooter}>
            <div className={css.page}>
            <ReactEcharts
                option={chartOption}
                notMerge={true}
                lazyUpdate={true}
                style={{width: '100%', height: CHART_HEIGHT}}
                onEvents={onEvents}
                onChartReady={handleReady}
            />
            <p className={css.hint}>
                Drag the slider handles to zoom, drag its middle to pan, shift + scroll over the chart to zoom.
                Your repo picks and date window are remembered in this browser.
            </p>
            <RangeControls
                range={range}
                applyRange={applyRange}
                showOther={showOther}
                setShowOther={setShowOther}
                showTotal={showTotal}
                setShowTotal={setShowTotal}
                onReset={handleReset}
            />
            <RepoPicker
                selected={selected}
                toggle={toggleRepo}
                setSelected={setSelected}
                colorOf={colorOf}
            />
            <StatsTable rows={statsRows} range={range}/>
            </div>
        </NetFoundryLayout>
    );
}
