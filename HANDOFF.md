# one-table 交接

这个文件记录等 Lee 定的事;项目说明见 README.md,演示手册见 docs/KIOSK_DEMO_RUNBOOK.md。

## 等 Lee

- **[决定] README.md:15 的死链删掉还是补文件** — 链到的 `docs/LUNA_MAX_EXECUTION_RUNBOOK.md` 在 git 历史里从未存在过;推荐删链接 · 不定则读者继续点到 404 · 自 2026-10-07
- **[决定] 「demo」的叫法** — 现在同一个词指部署的站点(wrangler.jsonc 的 env `demo`、`demo-grocer`、`demo-pavilion`)和配置(`tenants/sample-grocer` 等),`demo-grocer` 站用的是 `sample-grocer` 租户;推荐站点叫「演示站」、配置叫「租户」 · 不定则术语表收不进这个词,演示手册也写不清哪个站用哪个租户 · 自 2026-10-07
- **[决定] docs/KIOSK_DEMO_RUNBOOK.md:33-43 是否过时** — 手册说 100 道节庆菜还没配图、要删 `tenant.json` 的 `seasonal` 字段,但 main 上三个 `tenants/*/tenant.json` 都已没有 `seasonal`,提交 e7eaa6b 也说全部已配图;线上演示站的状态未核实。推荐:Lee 确认演示站已全部有图后,删掉 §4 的「未配图」段和 `seasonal` 说明 · 不定则现场演示照旧手册操作,会主动回避其实已可用的场合 · 自 2026-10-07
