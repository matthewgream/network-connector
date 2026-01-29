#!/usr/bin/env node

const readline = require('readline');

function parseTimestamp(line) {
    const match = line.match(/^(\w{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return undefined;
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const year = new Date().getFullYear();
    return new Date(year, months[match[1]], parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5]));
}

function parseLatency(line) {
    if (!line.includes('connectivity:')) return undefined;
    const match = line.match(/(\d+\.?\d*)ms/);
    return match ? parseFloat(match[1]) : undefined;
}

function percentile(sorted, p) {
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx), upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function calcStats(values) {
    if (values.length === 0) return undefined;
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n, min = sorted[0], max = sorted[n - 1];
    const p50 = percentile(sorted, 50), p95 = percentile(sorted, 95), p99 = percentile(sorted, 99);
    if (n === 1) return { mean, ci: 0, stddev: 0, n, min, max, p50, p95, p99 };
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
    const stddev = Math.sqrt(variance);
    const tValues = { 2: 12.71, 3: 4.30, 4: 3.18, 5: 2.78, 6: 2.57, 7: 2.45, 8: 2.36, 9: 2.31, 10: 2.26, 15: 2.13, 20: 2.09, 30: 2.04 };
    let t = 1.96;
    for (const [df, tv] of Object.entries(tValues))
        if (n - 1 <= parseInt(df)) { t = tv; break; }
    const ci = t * (stddev / Math.sqrt(n));
    return { mean, ci, stddev, n, min, max, p50, p95, p99 };
}

function groupByDay(data) {
    const now = Date.now();
    const buckets = new Map();
    for (const { timestamp, latency } of data) {
        const dayIndex = Math.floor((now - timestamp.getTime()) / (24 * 60 * 60 * 1000));
        if (!buckets.has(dayIndex)) buckets.set(dayIndex, []);
        buckets.get(dayIndex).push(latency);
    }
    return buckets;
}

function groupByHour(data) {
    const buckets = new Map();
    for (const { timestamp, latency } of data) {
        const hour = timestamp.getHours();
        if (!buckets.has(hour)) buckets.set(hour, []);
        buckets.get(hour).push(latency);
    }
    return buckets;
}

function pad(str, len, right = false) {
    str = String(str);
    return right ? str.padEnd(len) : str.padStart(len);
}

async function main() {
    const data = [];
    const rl = readline.createInterface({
        input: process.stdin,
        terminal: false
    });
    for await (const line of rl) {
        const timestamp = parseTimestamp(line);
        const latency = parseLatency(line);
        if (timestamp && latency)
            data.push({ timestamp, latency });
    }
    if (data.length === 0) {
        console.log('No connectivity data found');
        process.exit(1);
    }

    const dayBuckets = groupByDay(data);
    console.log('\n=== DAILY LATENCY (ms) ===\n');
    console.log('Period            │   N   │   p50 │   p95 │   p99 │    Min │    Max');
    console.log('──────────────────┼───────┼───────┼───────┼───────┼────────┼───────');
    for (const dayIndex of [...dayBuckets.keys()].sort((a, b) => a - b)) {
        const s = calcStats(dayBuckets.get(dayIndex));
        const label = dayIndex === 0 ? 'Last 24h' : dayIndex === 1 ? '24-48h ago' : `${dayIndex * 24}-${(dayIndex + 1) * 24}h ago`;
        console.log(
            `${pad(label, 17, true)} │ ` +
            `${pad(s.n, 5)} │ ` +
            `${pad(s.p50.toFixed(1), 5)} │ ` +
            `${pad(s.p95.toFixed(1), 5)} │ ` +
            `${pad(s.p99.toFixed(1), 5)} │ ` +
            `${pad(s.min.toFixed(1), 6)} │ ` +
            `${pad(s.max.toFixed(1), 6)}`
        );
    }

    const overall = calcStats(data.map(d => d.latency));
    console.log('──────────────────┼───────┼───────┼───────┼───────┼────────┼───────');
    console.log(
        `${pad('OVERALL', 17, true)} │ ` +
        `${pad(overall.n, 5)} │ ` +
        `${pad(overall.p50.toFixed(1), 5)} │ ` +
        `${pad(overall.p95.toFixed(1), 5)} │ ` +
        `${pad(overall.p99.toFixed(1), 5)} │ ` +
        `${pad(overall.min.toFixed(1), 6)} │ ` +
        `${pad(overall.max.toFixed(1), 6)}`
    );
    
    const hourBuckets = groupByHour(data);
    console.log('\n=== TIME OF DAY (ms) ===\n');
    console.log('Hour  │   N   │   p50 │   p95 │   p99 │    Min │    Max │ Histogram');
    console.log('──────┼───────┼───────┼───────┼───────┼────────┼────────┼──────────────────────────');
    const maxP95 = Math.max(...[...hourBuckets.values()].map(v => calcStats(v).p95));
    for (let hour = 0; hour < 24; hour++) {
        const values = hourBuckets.get(hour);
        if (!values || values.length === 0) {
            console.log(`${pad(hour.toString().padStart(2, '0') + ':00', 5, true)} │     - │     - │     - │     - │      - │      - │`);
            continue;
        }
        const s = calcStats(values);
        console.log(
            `${pad(hour.toString().padStart(2, '0') + ':00', 5, true)} │ ` +
            `${pad(s.n, 5)} │ ` +
            `${pad(s.p50.toFixed(1), 5)} │ ` +
            `${pad(s.p95.toFixed(1), 5)} │ ` +
            `${pad(s.p99.toFixed(1), 5)} │ ` +
            `${pad(s.min.toFixed(1), 6)} │ ` +
            `${pad(s.max.toFixed(1), 6)} │ ${'█'.repeat(Math.round((s.p95 / maxP95) * 25))}`
        );
    }
    
    console.log('');
}

main();
