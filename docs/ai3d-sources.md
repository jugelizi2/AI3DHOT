# AI3DHOT 信源与行业配置

核查日期：2026-10-19（Asia/Shanghai）。

## 定位

AI3DHOT / AI 建模热点，面向建模师、设计工程师、产品经理、行业管理者与研究开发者。以 CAD 工程与生成式 3D 为双重点，覆盖 CAE、CAM、BIM、DCC、三维重建、空间智能和直接影响建模的几何底座。通用大模型、Agent 和 MCP 只有与具体建模任务有实质联系时收录。

六类内容：模型、产品、论文、实践、行业、观点。领域用标签与主题页表达，可跨域。分类 key 沿用框架原值，避免改动接口和既有数据的含义；显示名、分类指引和主题已按行业定制。

## 启用的免费来源

免费指不需要额外采集服务的 API 费用，后续模型推理仍按所选服务计费。

共 26 项：20 个 RSS/Atom（含 3 条 arXiv 关键词查询）与 6 个网页列表。以下是对真实 HTTP 响应的核查；将保存的响应交给项目原有 fetchRss / fromHtml 解析器回放，检查标题、原文链接和可解析日期。它不等于已经验证全部文章的正文提取、模型判断或线上持续可用性。未调用付费模型、X 或公众号服务。

| ID | 来源与入口 | 类型 | 解析条数 / 有日期 |
|---|---|---|---|
| `rss-rhino` | [Rhino News](https://blog.rhino3d.com/feeds/posts/default?alt=rss) | rss | 25 / 25 |
| `rss-blender` | [Blender Developers Blog](https://code.blender.org/feed/) | rss | 10 / 10 |
| `rss-forma` | [Autodesk Forma](https://blogs.autodesk.com/forma/feed/) | rss | 10 / 10 |
| `rss-simscale` | [SimScale Blog](https://www.simscale.com/blog/feed/) | rss | 10 / 10 |
| `rss-nvidia-technical` | [NVIDIA Technical Blog](https://developer.nvidia.com/blog/feed/) | rss | 100 / 100 |
| `rss-siemens-nx` | [Siemens NX Design](https://blogs.sw.siemens.com/nx-design/feed/) | rss | 10 / 10 |
| `rss-siemens-cam` | [Siemens NX Manufacturing](https://blogs.sw.siemens.com/nx-manufacturing/feed/) | rss | 10 / 10 |
| `rss-siemens-simcenter` | [Siemens Simcenter](https://blogs.sw.siemens.com/simcenter/feed/) | rss | 10 / 10 |
| `rss-hyper3d` | [Hyper3D / Rodin](https://hyper3d.ai/blog/rss.xml) | rss | 12 / 12 |
| `rss-hugging-face` | [Hugging Face Blog](https://huggingface.co/blog/feed.xml) | rss | 881 / 881 |
| `rss-microsoft-research` | [Microsoft Research](https://www.microsoft.com/en-us/research/feed/) | rss | 10 / 10 |
| `rss-deepmind` | [Google DeepMind](https://deepmind.google/blog/rss.xml) | rss | 100 / 100 |
| `rss-develop3d` | [DEVELOP3D](https://develop3d.com/feed/) | rss | 10 / 10 |
| `rss-voxelmatters` | [VoxelMatters](https://www.voxelmatters.com/feed/) | rss | 10 / 10 |
| `rss-80lv` | [80 Level](https://80.lv/feed) | rss | 10 / 10 |
| `rss-qbitai` | [量子位](https://www.qbitai.com/feed) | rss | 10 / 10 |
| `rss-cadzxw` | [CAD自学网](https://www.cadzxw.com/feed) | rss | 10 / 10 |
| `rss-arxiv-cad` | [arXiv · CAD 与几何表示](https://export.arxiv.org/api/query?search_query=all:%22text-to-cad%22+OR+all:%22CAD+generation%22+OR+all:%22B-rep%22&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending) | rss | 12 / 12 |
| `rss-arxiv-3d` | [arXiv · 三维生成](https://export.arxiv.org/api/query?search_query=all:%22text-to-3d%22+OR+all:%22image-to-3d%22+OR+all:%223D+generation%22&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending) | rss | 12 / 12 |
| `rss-arxiv-recon` | [arXiv · 三维重建与神经表示](https://export.arxiv.org/api/query?search_query=all:%223D+reconstruction%22+OR+all:%22Gaussian+splatting%22+OR+all:%22neural+radiance%22&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending) | rss | 12 / 12 |
| `web-zoo` | [Zoo Blog](https://zoo.dev/blog) | web_list | 41 / 41 |
| `web-adam` | [Adam CAD Blog](https://adam.new/blog) | web_list | 6 / 6 |
| `web-sloyd` | [Sloyd Blog](https://www.sloyd.ai/blog) | web_list | 140 / 140 |
| `web-backflip` | [Backflip Blog](https://www.backflip.ai/blog) | web_list | 4 / 4 |
| `web-worldlabs` | [World Labs Research & Insights](https://www.worldlabs.ai/blog) | web_list | 13 / 13 |
| `web-autodesk-research` | [Autodesk Research · Featured](https://www.research.autodesk.com/blog/) | web_list | 1 / 1 |

- 同一厂商的多个入口绑定同一 owner_entity_id，例如 Siemens 的 CAD、CAM、CAE 博客；避免多入口重复扩大热度。三个 arXiv 查询也共用平台归属，不把同一论文在不同查询中命中算成多个独立参与方。
- RSS/Atom 校验通过仍需按行业预筛；NVIDIA、Hugging Face、DeepMind、Microsoft Research、量子位和通用工程媒体会包含无关内容。
- arXiv 是论文发现入口，不代表论文已经同行评审，也不默认读过 PDF 全文。
- Autodesk Research 的公开列表响应只包含一篇 featured 文章，因此明确命名 Featured；不声称覆盖其全部博客。其 /feed/ 返回默认 Hello world 内容，未配置。
- Zoo 页面声明 /feed.xml，但实际请求返回 404，改用已核查的 article + h2 + time 网页规则。
- Backflip 博客同时链接本方文章、官方提交的新闻稿和媒体报道；只采本方路径及 Business Wire 新闻稿，不把媒体转述标成其自有原文。
- Sloyd 列表有明显 SEO 与跨领域文章，交给相关性预筛和噪声规则判断，不因官方身份自动精选。
- 所有正文与全文 RSS 展示权限关闭，仅展示摘要和原文链接。
- 首次每源最多回灌 3 条，一般回看 3 个月，Adam / Autodesk Research 低频源回看 12 个月；按发布日期排序。历史回灌遵循框架的旧文不刷屏规则，不伪装成今天的新闻。

## X 账号：已配置，默认停用

共 8 个。身份由官网外链或官方帮助页交叉确认，不代表已经验证 SocialData 返回与账号当前更新频率。需配置 SOCIALDATA_API_KEY，在后台设置请求预算、试抓并确认正文与时间，再逐个启用。机构官方账号为 T1_5，绑定对应机构，publisherRole 为 organization。

| ID | 账号 | 身份依据 |
|---|---|---|
| `x-meshy` | [X：Meshy (@MeshyAI)](https://x.com/MeshyAI) | [官网或帮助页](https://help.meshy.ai/en/articles/15641671-official-meshy-links-how-to-avoid-fake-apps-and-scams) |
| `x-tripo` | [X：Tripo (@tripoai)](https://x.com/tripoai) | [官网或帮助页](https://www.tripo3d.ai/blog/guide1) |
| `x-hyper3d` | [X：Hyper3D / Deemos (@DeemosTech)](https://x.com/DeemosTech) | [官网或帮助页](https://hyper3d.ai/blog) |
| `x-zoo` | [X：Zoo (@zoodotdev)](https://x.com/zoodotdev) | [官网或帮助页](https://zoo.dev/blog) |
| `x-adam` | [X：Adam (@adamdotnew)](https://x.com/adamdotnew) | [官网或帮助页](https://adam.new/blog) |
| `x-world-labs` | [X：World Labs (@theworldlabs)](https://x.com/theworldlabs) | [官网或帮助页](https://www.worldlabs.ai/blog) |
| `x-shapr3d` | [X：Shapr3D (@shapr3d)](https://x.com/shapr3d) | [官网或帮助页](https://www.shapr3d.com/blog) |
| `x-onshape` | [X：Onshape (@Onshape)](https://x.com/Onshape) | [官网或帮助页](https://www.onshape.com/en/blog/) |

## 公众号：已找到的替代入口与候选

量子位与 CAD自学网均有已验证的免费 RSS，优先使用它们。也在 sources.json 预留对应 mp_account，enabled=false，记录官网公开的微信号 wxid。需 DAJIALA_KEY；服务是否接受该公开微信号尚未试抓验证，必要时先解析原始 ghid，填入配置后再启用。避免同时启用两个入口造成重复采集与额外费用。

| ID | 名称 / 公开微信号 | 依据 |
|---|---|---|
| `mp-qbitai` | 量子位 / `QbitAI` | [来源](https://www.qbitai.com/%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7) |
| `mp-cadzxw` | CAD自学网 / `cadzxw` | [来源](https://www.cadzxw.com/zmtzh.html) |

补充候选：[3D视觉工坊](https://github.com/qxiaofan/awesome-3d-computer-vision-from-0-to-1)（维护者公开仓库确认公众号定位，覆盖重建、点云、三维视觉）。尚未找到足够可靠的原始 ghid，不写入可执行配置，不编造标识。补充中文线索：[数字仿真网](https://www.cdsnet.com.cn/huodong/725.html?aid=722)在自身网站明确列出公众号 CDSNET，覆盖 AI + 仿真；[腾讯混元](https://developer.cloud.tencent.com/developer/zone/tencenthunyuan)官方专区确认同名公众号；[机器之心作者页](https://www.tmtpost.com/user/296451)自述公开微信号 almosthuman2014。它们尚未通过付费服务解析原始 ghid 与试抓，暂列候选，不宣称已经接通。

## 已查找但未启用的来源

| 来源 | 本轮结果 / 后续方式 |
|---|---|
| [Meshy Blog](https://www.meshy.ai/blog) | 搜索可读，本机直接请求失败；已配置默认停用的官方 X 账号。可在实际部署网络复查网页，或后续接 Jina。 |
| [Tripo Blog](https://www.tripo3d.ai/blog) | 本机直接请求失败；官方 X 已配置为停用。开发者更新日志同样需在部署网络复查。 |
| [Meshy 更新日志](https://docs.meshy.ai/en/webapp/changelog) | 官方搜索结果可见，当前网络未完成有效正文与日期解析；不写猜测的时间规则。 |
| [Tripo 开发者更新日志](https://developers.tripo3d.ai/en/docs/changelog) | 当前本机读取失败；保留后续入口。 |
| [AEC Magazine](https://aecmag.com/feed/) | 本机请求超时。 |
| [CG Channel](https://www.cgchannel.com/feed/) | 本机请求失败。 |
| [3D Printing Industry](https://3dprintingindustry.com/feed/) | 本机请求失败。 |
| [Autodesk Fusion](https://www.autodesk.com/products/fusion-360/blog/feed/) | HTTP 403，不绕过限制；可在部署网络复查。 |
| [Onshape](https://www.onshape.com/en/blog/) | 所试 rss.xml 返回 HTML，不当作有效 RSS；官网确认 X 账号，预留停用。 |
| [Shapr3D](https://www.shapr3d.com/blog) | 返回内容库页面，未核查出完整的文章链接与日期选择器；官方 X 预留停用。 |
| [CSM](https://www.csm.ai/blog) | 本机请求失败。 |
| [Kaedim](https://www.kaedim3d.com/blog) | 所试路径 404，不能视为有效博客。 |
| [Hunyuan3D](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1)、[TRELLIS.2](https://github.com/microsoft/TRELLIS.2)、[MCP for Blender](https://github.com/ahujasid/mcp-for-blender) | 值得长期关注；不能用空 Releases 流冒充动态源。需另行核实公告、项目页或上游博客入口，不采普通代码提交当新闻。 |

## 每日采集策略

- 所有预置信源的 `interval_minutes` 为 1440，已启用的 26 个 RSS、网页来源每 24 小时采集一次。X 和公众号继续停用。
- 后台“设置 → 抓取频率”可统一修改 RSS、网页与 JSON 来源的间隔和下次采集时间，保存后新建来源继承此值；仍可在单个信源详情页覆盖。设置保存在数据库并记入审计，重启后保留。
- `site/site.ts` 的 `SOURCE_DEFAULTS.intervalMinutes=1440` 是数据库尚未保存设置时的默认值；`autoAdjustInterval=false` 停用自动调频，worker 启动时清理旧的自动调频队列。
- 每次完成后安排下一次抓取，并非固定整点；失败等待也不短于 24 小时。后台仍可为单个信源手动修改间隔或手动采集。
- 当前运行库已更新为 1440 分钟，并按最近一次抓取时间重新安排下次采集。只改种子配置不会覆盖已有数据库；以后在设置页修改即可，无需重启。
- `SITE.github=null` 关闭桌面侧栏和移动端“我的”页的 GitHub 开源入口。

## 配置边界与上线

- 行业提示词保留七种内容类型、五维评分权重、输入安全边界和 JSON 输出格式；重写专业价值与噪声例子。
- selection.ts 门槛维持 T1=60、T1_5=65、T2=76、understandFloor=50。尚未使用人工金标样本校准，不声称精选准确率已达标。
- 日报 08:00、周一周报 10:00、每月 1 日月报 10:30（北京时间）保持默认。
- site/models.ts 默认仍使用环境变量指定的 OpenAI 兼容服务，未替用户选择或购买模型。未写入真实密钥、生产域名或运营者身份。
- site/pages/terms.md 与 privacy.md 保留原模板，运营方式与条款需要站长本人确定后再上线；本次不代替站长作承诺。
- 正式运行前配置 SITE_URL、模型 API 和管理员凭据。开发预览不启动 worker，采集、模型、飞书与 IndexNow 开关保持关闭。
- sources.json 由 seed.ts 只新增缺少的 ID。重新 seed 不会覆盖已有源配置或 enabled 状态；已有默认 18 个泛 AI 源需在后台暂停，本次不删除数据库资料。改文件后还需重新构建并重启相关进程。

## 本次验证结果

- npm run typecheck：通过。
- 网页生产构建：通过。
- 完整后端与独立测试：Linux / Node.js 24 / PostgreSQL 17 下 928 项通过，0 失败；原测试中的默认行业主题样例已替换为 Zoo、Meshy、Backflip 等，不降低断言。
- 最终配置补充验证：分析、分类更正与主题相关 16 项通过。
- 浏览器测试：Chromium 与 WebKit 相关 59 项通过，0 失败。
- 临时空数据库站点：主要页面、RSS、公开 API、图标和 MCP 的 30 项冒烟检查通过。
- 26 项启用信源的真实响应共解析出 1479 条有标题、链接和日期的记录；其中包括较长历史订阅，不代表首轮会导入 1479 条，实际回灌受每源 3 条等限制。没有调用付费模型进行质量评测。
- git diff --check：通过。没有提交或推送 Git。临时预览与测试服务在验证后关闭。
