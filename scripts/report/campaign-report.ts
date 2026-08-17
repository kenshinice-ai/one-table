import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Pulls the last seven days of beacon counts from Workers Analytics Engine and
 * writes a letterhead-styled campaign report — the weekly number a venue
 * partner receives, produced by one command instead of an afternoon:
 *
 *   CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run report:campaign
 *
 * The token needs only the Account Analytics read permission. Output lands in
 * .generated/reports/ as Markdown (for the record) and HTML (print → PDF, A4).
 */
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? '';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? '';
const DAYS = Number(process.env.REPORT_DAYS ?? 7);

if (!ACCOUNT || !TOKEN) {
  console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read).');
  process.exit(1);
}

const EVENT_LABELS: Record<string, { zh: string; en: string }> = {
  scan: { zh: '扫码进入', en: 'QR scans' },
  compose: { zh: '配出一桌菜', en: 'Menus composed' },
  list: { zh: '打开购物清单', en: 'Shopping lists opened' },
  route: { zh: '保存店内路线', en: 'Routes saved' },
};

const sql = `
  SELECT blob1 AS event, blob2 AS tenant, blob3 AS environment,
         SUM(_sample_interval * double1) AS count
  FROM onetable_events
  WHERE timestamp > NOW() - INTERVAL '${DAYS}' DAY
  GROUP BY event, tenant, environment
  ORDER BY tenant, event
  FORMAT JSON
`;

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/analytics_engine/sql`,
  { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: sql },
);
if (!response.ok) {
  console.error(`Analytics Engine query failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}

type Row = { event: string; tenant: string; environment: string; count: number };
const rows = ((await response.json()) as { data: Row[] }).data.map((row) => ({
  ...row,
  count: Math.round(Number(row.count)),
}));

const tenants = [...new Set(rows.map((row) => row.tenant))].sort();
const today = new Date().toISOString().slice(0, 10);
const period = `${new Date(Date.now() - DAYS * 86_400_000).toISOString().slice(0, 10)} – ${today}`;

function countFor(tenant: string, event: string) {
  return rows
    .filter((row) => row.tenant === tenant && row.event === event)
    .reduce((sum, row) => sum + row.count, 0);
}

// --- Markdown (the record) ---
const md: string[] = [
  `# 一桌 · One Table — 周度活动报告 / Weekly Campaign Report`,
  ``,
  `**统计期 Period**: ${period} （近 ${DAYS} 天 / last ${DAYS} days）`,
  ``,
  `> 数据为匿名聚合计数（无 Cookie、无个人数据）。每事件每会话至多记一次，因此数字可读作「达到该里程碑的会话数」。`,
  ``,
];
for (const tenant of tenants) {
  md.push(`## ${tenant}`, ``, `| 指标 Metric | 次数 Count |`, `| --- | ---: |`);
  for (const [event, label] of Object.entries(EVENT_LABELS)) {
    md.push(`| ${label.zh} · ${label.en} | ${countFor(tenant, event)} |`);
  }
  const scans = countFor(tenant, 'scan');
  const routes = countFor(tenant, 'route');
  if (scans > 0)
    md.push(
      ``,
      `扫码 → 路线转化 Scan → route conversion: **${Math.round((routes / scans) * 100)}%**`,
    );
  md.push(``);
}
if (!tenants.length) md.push(`_统计期内暂无数据 · No data points in this period._`, ``);

// --- HTML (letterhead, print → PDF A4) ---
const tenantSections = tenants
  .map((tenant) => {
    const rowsHtml = Object.entries(EVENT_LABELS)
      .map(
        ([event, label]) =>
          `<tr><td>${label.zh}<small>${label.en}</small></td><td class="n">${countFor(tenant, event)}</td></tr>`,
      )
      .join('');
    return `<section><h2>${tenant}</h2><table>${rowsHtml}</table></section>`;
  })
  .join('');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>One Table Weekly Campaign Report ${today}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; }
  body { font: 15px/1.6 "Inter", "PingFang SC", sans-serif; color: #0e1729; background: #fff; }
  .page { max-width: 210mm; min-height: 297mm; margin: 0 auto; padding: 22mm 20mm; border: 10px solid #0e1729; }
  .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 3px solid #a16207; padding-bottom: 12px; margin-bottom: 26px; }
  .head b { font-family: "Playfair Display", Georgia, serif; font-size: 24px; }
  .head span { color: #a16207; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; }
  h1 { font-family: "Playfair Display", Georgia, serif; font-size: 28px; margin-bottom: 4px; }
  .period { color: #5a5f6b; margin-bottom: 24px; }
  section { margin-bottom: 28px; }
  h2 { font-size: 17px; letter-spacing: 0.04em; text-transform: uppercase; color: #a16207; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 9px 4px; border-bottom: 1px solid #e6e2d9; }
  td small { display: block; color: #5a5f6b; font-size: 12px; }
  td.n { text-align: right; font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .note { color: #5a5f6b; font-size: 12px; margin-top: 32px; border-top: 1px solid #e6e2d9; padding-top: 12px; }
</style></head><body><div class="page">
  <div class="head"><b>PARADISE PRODUCTION</b><span>PWE STUDIO · 天域文创出品</span></div>
  <h1>一桌 · One Table 周度活动报告</h1>
  <p class="period">统计期 ${period}（近 ${DAYS} 天）</p>
  ${tenantSections || '<p>统计期内暂无数据 · No data points in this period.</p>'}
  <p class="note">数据为匿名聚合计数：无 Cookie、无个人数据、无行为轨迹。每事件每会话至多记一次，数字可读作「达到该里程碑的会话数」。<br>
  Anonymous aggregate counts only — no cookies, no personal data, no journey tracking. Each event is counted at most once per session.</p>
</div></body></html>
`;

const outDir = join(process.cwd(), '.generated', 'reports');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `campaign-${today}.md`), `${md.join('\n')}\n`);
writeFileSync(join(outDir, `campaign-${today}.html`), html);
console.log(
  JSON.stringify(
    {
      period,
      tenants,
      dataPoints: rows.length,
      out: `.generated/reports/campaign-${today}.{md,html}`,
    },
    null,
    2,
  ),
);
