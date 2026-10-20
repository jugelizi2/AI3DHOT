# Cursor Agent SDK

AI3DHOT 支持官方 `@cursor/sdk` 的本地 Agent 运行方式。它调用 Cursor 托管模型，不是在电脑上运行本地模型。

## 配置与切换

本地 `.env`：

```dotenv
CURSOR_API_KEY=在这里填写官方用户或服务账户的 API Key
CURSOR_MODEL=composer-2.5
```

密钥来自 Cursor Dashboard 的 API Keys，不能使用 Team Admin API Key。无需配置 Base URL。`.env` 不提交，也不打进镜像；前端不会收到密钥。

Docker 部署修改密钥后，重新创建后端容器加载环境：

```powershell
cd D:\temp\AI3DHOT
docker compose up -d --no-build --force-recreate api worker
docker compose exec -T worker node scripts/check-cursor.ts
```

检查脚本会执行一次真实付费请求，使用已有预算和回执，校验 JSON 后结束，不改生产模型路由。没有密钥时会在调用前报配置缺失。

通过后，在后台“模型与评测”按步骤选择 `cursor-agent` 并填写切换原因。也可在 `.env` 中为指定步骤设置，例如 `SUMMARIZE_MODEL=cursor-agent`、`REPORT_MODEL=cursor-agent`，然后重新创建后端容器。后台已保存的选择优先于环境变量。其他步骤继续使用原有 DeepSeek；随时可在后台切回 `default`。

`CURSOR_MODEL` 必须是该账户可以使用的准确模型 ID。默认先使用 Composer 2.5；更换 ID 会改变后续调用，历史结果不重新处理。2026-10-20 已使用本地密钥完成一次 Composer 2.5 真实连接检查，JSON 校验通过并记录了已完成回执；生产步骤仍使用 DeepSeek。连接检查只验证接口与返回格式，行业内容处理质量仍需通过后台评测确认。

## 调用边界

- 每次任务使用独立空工作目录和临时 JSONL 状态库，完成后清理；不读取本仓库内容、个人 Cursor 设置或项目规则。
- `tools: []`，不允许文件、Shell、联网、MCP 或子 Agent 工具；SDK 自动重试关闭。
- 当前适配器只接受文本。原有内容处理会根据模型能力跳过首图输入；直接传入图片会在付费调用前拒绝。
- 任务说明与输入按明确标注的字段传给 SDK；JSON 和既有文本输出解析器继续使用原来的 Zod 校验。未使用需要账户额外授权的 `systemPrompt` 功能。
- SDK 没有提供 OpenAI 的 `temperature` / `max_tokens` 同等接口。输出长度通过提示词约束，属于软限制；调用仍受超时和请求次数熔断约束，不把软限制声称为硬 Token 上限。
- 超时会请求取消任务并保留“结果未知”的回执，重试不会立即重复付费；后续恢复仍按框架原有流程处理。已经收到但不符合格式的回答记为不可用。

## 预算与成本

新增 `cursor` 服务的默认请求次数限制为每分钟 10、每小时 100、每天 300；可在后台“设置”的服务预算中调整，设为 0 可暂停。它限制请求次数，不代表美元消费上限；账户消费限制仍在 Cursor 控制台设置。

SDK 提供已结算费用时保存实际 USD 金额（包含额度抵扣时可能为 0）；账户未开通本地 Usage 权限或费用尚未结算时，实际费用保持未知。页面可根据 Token 与报价单独显示估算。2026-10-20 的 Composer 2.5 参考报价已录入；更换其他模型时，不会套用 Composer 的报价。

参考：[官方 SDK 文档](https://cursor.com/docs/sdk/typescript)、[官方模型与计费](https://cursor.com/docs/models-and-pricing)。
