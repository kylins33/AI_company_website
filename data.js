/**
 * @file    data.js
 * @brief   交互式 demo 数据层——window.DEMO_DATA
 * @author  ui-designer | 项目: self-intro | Phase 2 · T8
 * @date    2026-08-12
 *
 * @details
 * 本文件为「展厅 + 模拟器」交互 demo 的结构化内容源,供 app.js 读取绑定。
 * 数据与 Phase 1 交付物一致:
 *   - 术语基准: CONTEXT.md(零漂移)
 *   - 事实基准: t1-facts.md / t2-script.md / t5-arch-facts.md / t6-copy.md
 *   - 组织基准: company/departments/ 7 部门(ADR-0003)
 *   - 流水线基准: .claude/skills/start-company/SKILL.md(8 阶段 + 硬规则)
 *   - 经验基准: company/lessons/
 *
 * 术语注意:
 *   - 第 1 层验收规范词为「自动化检查」,勿写「自动检查」。
 *   - 品牌名唯一写法「思无界 Boundless Mind」;Logo 锁版用全大写「BOUNDLESS MIND」。
 *   - 8 阶段节点名 / 部门名 / 岗位名与 CONTEXT.md 一字不差。
 *
 * @note   禁止编造数据:brand.repoUrl 已填写实际部署地址——GitHub Pages 公司网站
 *         https://kylins33.github.io/AI_company_website/ (2026-08-12 部署)。
 * @warning 本文件只读挂载到全局 window.DEMO_DATA,不产生任何副作用。
 */
window.DEMO_DATA = {
  // =====================================================================
  // 品牌(Brand)
  // =====================================================================
  brand: {
    name: '思无界 Boundless Mind', // 品牌名唯一写法
    zh: '思无界', // 中文品牌字标
    enLock: 'BOUNDLESS MIND', // Logo 锁版(全大写,页眉/徽标用)
    en: 'Boundless Mind', // 正文/标题/页脚形态
    logoDesc: '无限环 ∞,靛蓝→青渐变,交汇四角星',
    tagline: '把想法交付成完整结果', // 主标
    mission: '致力于打造一台让任意想法都能交付成完整结果的 AI 公司', // 公司使命(页头常驻公司介绍)
    framework: 'AI 公司流水线 (AI Company Pipeline)', // 框架/产品名
    runOn: '运行于 Claude Code',
    deploy: 'GitHub Pages（公开，免登录访问，无需域名）',
    repoUrl: 'https://kylins33.github.io/AI_company_website/', // 2026-08-12 部署: GitHub Pages 公司网站
    subtitle: '公司自介绍 · 组织架构与运行机制'
  },

  // =====================================================================
  // 展厅(7 板块内容区 + 知识库)
  // =====================================================================
  gallery: [
    {
      id: 'what',
      title: '公司是什么',
      desc: '一家运行在 Claude Code 上的 AI 公司:一个 AI 项目经理,一群 AI 员工,一套 8 阶段流水线,把任意项目从想法交付成完整结果。',
      detail: [
        '每个员工是一份带职责、技能与规则的 markdown 档案(role.md + memory.md)',
        '配奖赏机制与监督机制,保障交付质量',
        '五要素齐备:md 员工 · 奖赏 · 监督 · 管理层分配·验收 · 完整交付',
        '定位差异:现有框架无一家同时具备这五要素;这套框架本身就是要开源分享的产品',
        '三者职责边界:skill 负责「启动与阶段流程」,员工按 role.md 执行,hooks 负责「硬约束」'
      ]
    },
    {
      id: 'org',
      title: '组织架构',
      desc: '7 部门基线。部门是「模板里的一个组件」,按项目组队时作为岗位来源。',
      showDepartments: true, // app.js 依此渲染部门卡片网格(DEMO_DATA.departments)
      detail: [
        '分层:管理层(管理部)/ 监管层(质量部,只读)/ 执行层(执行部·研发部·测试部·UI设计部门)/ 特殊部门(按项目挂载,虚线)',
        '协作流:管理部驱动 → 生产部门产出 → 测试部验证 → 质量部判定 → 人类批准',
        '质量部只判定、只记录,不代员工返工;测试证据由测试部(执行行为)产出,质量部只做判定(判定行为),职责分开',
        '岗位按项目增减;特殊部门需要时再建档案挂载',
        '设计取舍:四套被否方案(扁平两部门 / 质量部并入管理部 / 测试部并入质量部 / UI设计并入特殊部门)→ 监管与执行、判定与验证必须分离'
      ]
    },
    {
      id: 'pipeline',
      title: '8 阶段流水线',
      desc: '项目从进来到交付走 8 个阶段,每阶段产出关键文件,关键节点须获人类批准。',
      detail: [
        '8 个阶段(一字不差):立项 → 组队 → 拆解 → 执行 → 监督 → 验收 → 复盘 → 交付归档',
        '关键产物:PLAN.md / 项目组清单·STATUS.md / TASKS.md / 交付物 / 监督日志 / 三层验收证据 / lessons/ / deliverable/',
        '人类批准节点:立项(必须)、组队(必须)、拆解(可简化)、验收第 3 层(必须)',
        '硬规则:未通过三层验收的任务不得标完成、不得记绩效;项目状态 STATUS.md 每个阶段流转都要更新'
      ]
    },
    {
      id: 'acceptance',
      title: '三层验收',
      desc: '判定任务「完成」的流水线——自动化检查 → AI 验收 → 人类批准,通过才记绩效、才进交付物。',
      detail: [
        '第 1 层 自动化检查:测试/构建/清单,必须有输出证据',
        '第 2 层 AI 验收:验收员(只读)对照验收要点判定——「通过」(打分)或「打回」(具体反馈);fail-closed:证据不足默认打回',
        '第 3 层 人类批准:用户拍板',
        '打回闭环:未通过 → 带反馈打回 → 重做 → 重新验收(限次,超限上报)',
        '通过 → 打分写入员工工作记忆(memory.md),绩效驱动奖赏'
      ]
    },
    {
      id: 'reward-supervision',
      title: '奖赏与监督',
      desc: '绩效评分驱动奖赏机制;监督机制三重防线保障规则落地。',
      detail: [
        '绩效评分:验收环节对每个任务的打分,记入员工工作记忆(memory.md)',
        '奖赏机制:高分员工被分配更重要/更复杂任务,低分员工被更多监督或被替换',
        '监督机制三重防线:规则硬约束(hooks)→ AI 审核智能体 → 人类抽查',
        '规则硬约束须登记到 .claude/hooks/ 才能真正强制;只写在 role.md 的是软约束,靠自我遵守',
        '经验闭环:高频错误 → 建议沉淀进 lessons/ 或升为 hooks 硬约束'
      ]
    },
    {
      id: 'special',
      title: '特殊部门',
      desc: '需要外部专业工具才能达到交付质量、通用大模型无法胜任的部门,按项目需要再挂载。',
      detail: [
        '定义:图片/视频/声音/UI 素材等产出需专业工具;UI 设计本身归 UI设计部门,不属特殊部门',
        '按项目挂载:不预设固定岗位,项目需要时再建档案(例:媒体制作员 media)',
        '组队规则:AI 项目经理必须确认对应外部工具可用,不可用则给替代方案并记录在 PLAN.md',
        '部门文件必须标记「特殊部门:是」,并列出所需执行能力(外部工具/MCP/命令)',
        '媒体类工具链(ADR-0002):本地 edge-tts + ffmpeg 优先 → 云端 TTS(火山/Azure)→ 真视频(可灵/即梦)'
      ]
    },
    {
      id: 'start',
      title: '如何启动',
      desc: '一条命令 /start-company——读取公司目录、组建项目团队、驱动 8 阶段流水线。',
      detail: [
        '启动命令:/start-company(用户说「开一家公司做 X」即可触发)',
        '何时使用:新项目/想法要求完整交付;需要多岗位协作;需要奖赏/监督/验收治理',
        '启动前必做:读 CONTEXT.md(术语零漂移)、读 company/README.md、检查 projects/ 是否已有同名项目、检索 lessons/ 相关经验',
        'company/ 目录结构:employees/ · departments/ · templates/ · lessons/ · projects/<slug>/',
        '员工档案:role.md(职责、技能、规则、执行能力、验收标准)+ memory.md(绩效评分 + 工作经验)'
      ]
    },
    {
      id: 'knowledge',
      title: '公司知识库',
      desc: '跨项目沉淀经验与教训的地方,复盘写入、新项目检索,是「公司越用越聪明」的载体。',
      detail: [
        '经验文件:YYYY-MM-DD-<slug>.md,标注背景/结论/适用岗位/来源;只收可复用经验,不收流水账',
        '复盘环节写入;写入前先查重;新项目立项时按岗位检索并带进任务',
        '经验例·术语与品牌纪律:术语零漂移要逐词对照;品牌锁版变体必须显式登记(锁版 BOUNDLESS MIND / 正文 Boundless Mind)',
        '经验例·媒体/演示产出与渲染证据:PDF 页数用页树 /Count 汇总;渲染证据 = 命令 + exit_code + 产物字节三态吻合',
        '经验例·模板沉淀:内容媒体型项目(组队配置 + 验收要点)值得沉淀为 templates/ 正式模板'
      ]
    }
  ],

  // =====================================================================
  // 模拟器(开一家公司 · 8 阶段向导)
  // =====================================================================
  simulator: {
    title: '开一家公司',
    tagline: '从想法到完整结果,逐步走一遍 8 阶段流水线。每一步选择操作,观察流水线的硬规则。',
    steps: [
      {
        no: 1,
        title: '立项',
        desc: '用 /grilling 澄清需求:目标、交付物、验收标准、边界。',
        action: '写 company/projects/<slug>/PLAN.md,验收标准必须可判定;读 templates/ 选定模板依据。',
        options: [
          { label: '用 /grilling 澄清需求', good: true, note: '目标/交付物/验收标准/边界一次问清,禁止凭猜测拆解' },
          { label: '需求不清就直接写 PLAN.md', good: false, note: '违反「禁止凭猜测拆解」,验收标准无法判定' }
        ],
        result: '产出 PLAN.md(验收标准可判定);必须获人类批准才能进入组队。'
      },
      {
        no: 2,
        title: '组队',
        desc: '按项目类型从 templates/ 选模板,或手动配置部门/员工。',
        action: '参考员工 memory.md 绩效,高分优先接核心岗位;产出项目组清单,更新 STATUS.md。',
        options: [
          { label: '特殊部门:确认外部工具可用', good: true, note: '不可用则给替代方案并记录在 PLAN.md' },
          { label: '特殊部门:跳过工具确认', good: false, note: '外部工具不可用时交付质量无保障,违反组队规则' }
        ],
        result: '产出项目组清单,更新 STATUS.md;必须获人类批准。'
      },
      {
        no: 3,
        title: '拆解',
        desc: '用 /writing-plans 把项目拆成任务,写 TASKS.md。',
        action: '每项任务必须有负责人(员工)+ 交付物 + 验收要点;相关经验从 lessons/ 带进任务。',
        options: [
          { label: '每个任务都带交付物+验收要点', good: true, note: '可验收、可打回,避免返工' },
          { label: '大任务不拆细、无验收要点', good: false, note: '经验:拆解过粗导致返工(company/lessons/)' }
        ],
        result: '产出 TASKS.md;人类批准(可简化为确认)。'
      },
      {
        no: 4,
        title: '执行',
        desc: '按 employees/<name>/role.md 派员工干活,员工通过引用 skills 执行。',
        action: '项目经理不代劳;特殊岗位用员工声明的外部工具(MCP/命令)完成专业部分。',
        options: [
          { label: '员工按 role.md 执行,项目经理只管理', good: true, note: '硬约束:项目经理不得替员工执行被分配的任务' },
          { label: '项目经理亲自代劳', good: false, note: '违反硬约束,监督机制会记录并上报' }
        ],
        result: '各员工产出交付物;进度由项目经理监督,发现偏离立即纠正或打回。'
      },
      {
        no: 5,
        title: '监督',
        desc: '监督员(只读)抽查产出,对照该岗位 rules。',
        action: '发现问题记录到监督日志,轻微的打回纠正,重大的上报项目经理。',
        options: [
          { label: '问题记录到监督日志并上报', good: true, note: '监督员只读:只检查与上报,不修改任何交付物' },
          { label: '发现问题沉默不记录', good: false, note: '监督日志需完整可追溯,上报的问题要对得上证据' }
        ],
        result: '高频错误建议沉淀进 lessons/ 或升为 hooks 硬约束。'
      },
      {
        no: 6,
        title: '验收',
        desc: '验收为三层——自动化检查 → AI 验收 → 人类批准,判定任务「完成」的流水线。',
        action: '依次走三层;未通过 → 带反馈打回重做(限次迭代,超限上报)。',
        options: [
          { label: '第 1 层 自动化检查', good: true, note: '测试/构建/清单,必须有输出证据' },
          { label: '第 2 层 AI 验收', good: true, note: '验收员只读判定:通过(打分)/打回(具体反馈);fail-closed 证据不足默认打回' },
          { label: '第 3 层 人类批准', good: true, note: '用户拍板;通过才记绩效、才进交付物' }
        ],
        result: '通过 → 打分写入员工 memory.md 绩效,驱动奖赏;未通过 → 带反馈打回重做(限次,超限上报)。'
      },
      {
        no: 7,
        title: '复盘',
        desc: '经验沉淀,让公司越用越聪明。',
        action: '经验写入 company/lessons/(先查重),标注适用岗位;更新受影响的公司模板。',
        options: [
          { label: '经验写入 lessons/ 并更新模板', good: true, note: '更新受影响的公司模板与员工 memory.md 经验段' },
          { label: '经验不沉淀、直接跳过', good: false, note: '高频错误会重复发生,公司无法积累' }
        ],
        result: '公司知识库更新,相关模板与员工工作记忆同步更新。'
      },
      {
        no: 8,
        title: '交付归档',
        desc: '交付物入库,项目收尾。',
        action: '交付物进 company/projects/<slug>/deliverable/;项目知识入库,更新 STATUS.md 为已交付。',
        options: [
          { label: '交付物进 deliverable/ 并输出交付总结', good: true, note: '总结:做了什么/验收证据/遗留问题/下一步' },
          { label: '交付物散落、状态不更新', good: false, note: '硬规则:STATUS.md 每个阶段流转都要更新' }
        ],
        result: 'STATUS.md 置为已交付,输出交付总结——从想法到完整结果。'
      }
    ]
  },

  // =====================================================================
  // 7 部门(组织架构网格数据,ADR-0003 基线)
  // =====================================================================
  departments: [
    {
      name: '管理部',
      color: '#4F46E5',
      desc: '公司唯一常规管理层,由 AI 项目经理构成,负责立项、组队、监督组织与验收组织。',
      cap: '纯 LLM 推理(编排/判定/汇报)',
      acceptance: '任务清单清晰完整、可执行;关键决策有记录、有理由',
      roles: [
        { name: 'ai-project-manager', zh: 'AI 项目经理', desc: '统一管理层:立项、组队、拆解、分配、监督、组织三层验收;只管理不代劳;关键节点请人类批准。' }
      ]
    },
    {
      name: '质量部',
      color: '#64748B',
      desc: '只读监管岗所在部门:只判定、只记录,不代员工返工;fail-closed 证据不足默认打回。',
      cap: '纯 LLM 推理 + 只读工具',
      acceptance: '只读判定、证据可核对、结论可复现',
      roles: [
        { name: 'acceptance-reviewer', zh: '验收员', desc: '三层验收第 2 层 AI 验收:只读对照验收要点判定,「通过」打分或「打回」具体反馈;是绩效评分的来源。' },
        { name: 'auditor', zh: '监督员', desc: '监督机制第二道防线「AI 审核智能体」:执行中只读抽查产出、维护监督日志,问题上报项目经理。' }
      ]
    },
    {
      name: '执行部',
      color: '#F59E0B',
      desc: '实际产出交付物的部门,岗位按项目增减(文档员、研究员、视觉设计员等)。',
      cap: '纯 LLM 推理 + 文件读写 / 检索 / Node+Edge 渲染',
      acceptance: '交付物满足任务验收要点,读者/用户可独立验证',
      roles: [
        { name: 'documentarian', zh: '文档员', desc: '把复杂系统讲成人话:介绍文档、使用说明、项目交付文档;术语与 CONTEXT.md 零漂移。' },
        { name: 'researcher', zh: '研究员', desc: '为项目收集事实与素材:调研、验证假设、产出带来源的证据,结论必须可溯源。' },
        { name: 'visual-designer', zh: '视觉设计员', desc: '把内容做成清晰的视觉呈现:HTML 幻灯片、SVG 图解、视觉规范,Edge 渲染产出可交付文件。' }
      ]
    },
    {
      name: '研发部',
      color: '#F43F5E',
      desc: '软件研发岗位所在部门,由研发工程师构成,产出代码与系统。',
      cap: 'LLM 推理 + 代码执行',
      acceptance: '构建通过、功能符合验收要点;关键路径有测试证据、无阻塞性缺陷',
      roles: [
        { name: 'developer', zh: '研发工程师', desc: '按任务验收要点实现功能,产出可构建可运行的代码;关键路径补测试证据,交付前自查编译/运行/错误处理。' }
      ]
    },
    {
      name: '测试部',
      color: '#10B981',
      desc: '执行验证的部门,由测试工程师构成,产出可复现的测试证据;与质量部(只读判定)职责分开,保证判定独立。',
      cap: 'LLM 推理 + 运行测试/构建',
      acceptance: '每个验收要点有对应测试与输出证据;缺陷含复现步骤与最小用例',
      roles: [
        { name: 'tester', zh: '测试工程师', desc: '执行行为:对照验收要点设计并运行测试、产出证据;发现缺陷给复现步骤与最小用例。' }
      ]
    },
    {
      name: 'UI设计部门',
      color: '#8B5CF6',
      desc: '产品界面与交互设计岗位所在部门;执行能力为纯 LLM + HTML/CSS 渲染,不属特殊部门。',
      cap: '纯 LLM 推理 + HTML/CSS + Edge 渲染',
      acceptance: '界面可渲染、关键流程可走通;视觉规范一致、中文排版可读',
      roles: [
        { name: 'ui-designer', zh: 'UI设计师', desc: '把需求变成可渲染的界面原型(HTML/CSS);维护界面视觉规范,复用设计组件;需图片素材时按特殊部门流程挂载。' }
      ]
    },
    {
      name: '特殊部门',
      color: '#0EA5E9',
      desc: '需要专业工具才能达到交付质量、通用大模型无法胜任的部门(图片/视频/声音/UI 素材等);按项目挂载,不预设固定岗位。',
      cap: '外部专业工具(MCP/命令)',
      acceptance: '借助外部工具/MCP/命令产出达到交付质量',
      mountRule: '组队时项目经理必须确认对应外部工具可用,不可用则给替代方案并记录在 PLAN.md。',
      roles: [
        { name: 'media', zh: '媒体制作员', desc: '按项目挂载示例:借助外部专业工具(edge-tts/ffmpeg/云端 TTS 等)产出媒体素材,项目需要时再建档案。' }
      ]
    }
  ]
};
