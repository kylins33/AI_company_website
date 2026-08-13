/**
 * @file    stats-data.js
 * @brief   公司统计快照(员工绩效 · 境界总览)——由 company/tools/build-stats.js 自动生成
 * @author  kylins(生成器) | @date 2026-08-13
 *
 * @details 请勿手改本文件。员工绩效/境界变动后重跑:
 *   node company/tools/build-stats.js
 * 然后推送公司仓库与线上网站,线上展厅统计即同步更新。
 * 字段语义见 app.js 的 renderStats() 与 company/levels.md。
 */
window.STATS_DATA = {
  "generatedAt": "2026-08-13",
  "summary": {
    "employeeCount": 10,
    "taskCount": 10,
    "avgScore": 94.3,
    "excellentCount": 6,
    "breakthruCount": 6,
    "topRealm": "炼气·后期"
  },
  "ladder": [
    {
      "realm": "炼气",
      "desc": "入门:熟悉公司流水线,能完成常规任务"
    },
    {
      "realm": "筑基",
      "desc": "稳了:理解流水线,交付稳定"
    },
    {
      "realm": "金丹",
      "desc": "老手:任务质量稳定,独立产出完整交付"
    },
    {
      "realm": "元婴",
      "desc": "骨干:能扛核心任务,出问题能自查修复"
    },
    {
      "realm": "化神",
      "desc": "专家:复杂任务的主导者"
    },
    {
      "realm": "炼虚",
      "desc": "高手:跨模块协调,沉淀方法论"
    },
    {
      "realm": "合体",
      "desc": "大能:带队攻坚,输出可复用套路"
    },
    {
      "realm": "大乘",
      "desc": "长老:几乎不返工,能带新人"
    },
    {
      "realm": "渡劫",
      "desc": "准仙:每个任务追求极致,经受严格验收"
    },
    {
      "realm": "飞升",
      "desc": "仙人:封顶,公司的活化石"
    }
  ],
  "employees": [
    {
      "slug": "documentarian",
      "zh": "文档员",
      "realm": "炼气·后期",
      "idx": 2,
      "score": 100,
      "avgScore": 98,
      "tasks": 2,
      "excellent": 2,
      "breakthru": 2
    },
    {
      "slug": "researcher",
      "zh": "研究员",
      "realm": "炼气·后期",
      "idx": 2,
      "score": 96,
      "avgScore": 96,
      "tasks": 2,
      "excellent": 2,
      "breakthru": 2
    },
    {
      "slug": "ui-designer",
      "zh": "UI设计师",
      "realm": "炼气·中期",
      "idx": 1,
      "score": 96,
      "avgScore": 95,
      "tasks": 2,
      "excellent": 1,
      "breakthru": 1
    },
    {
      "slug": "visual-designer",
      "zh": "视觉设计员",
      "realm": "炼气·中期",
      "idx": 1,
      "score": 95,
      "avgScore": 95,
      "tasks": 1,
      "excellent": 1,
      "breakthru": 1
    },
    {
      "slug": "acceptance-reviewer",
      "zh": "验收员",
      "realm": "炼气·初期",
      "idx": 0,
      "score": null,
      "avgScore": null,
      "tasks": 0,
      "excellent": 0,
      "breakthru": 0
    },
    {
      "slug": "ai-project-manager",
      "zh": "AI 项目经理",
      "realm": "炼气·初期",
      "idx": 0,
      "score": null,
      "avgScore": null,
      "tasks": 0,
      "excellent": 0,
      "breakthru": 0
    },
    {
      "slug": "auditor",
      "zh": "监督员",
      "realm": "炼气·初期",
      "idx": 0,
      "score": null,
      "avgScore": null,
      "tasks": 0,
      "excellent": 0,
      "breakthru": 0
    },
    {
      "slug": "developer",
      "zh": "研发工程师",
      "realm": "炼气·初期",
      "idx": 0,
      "score": 93,
      "avgScore": 93,
      "tasks": 1,
      "excellent": 0,
      "breakthru": 0
    },
    {
      "slug": "media",
      "zh": "媒体制作员 (Media Producer)",
      "realm": "炼气·初期",
      "idx": 0,
      "score": 92,
      "avgScore": 92,
      "tasks": 1,
      "excellent": 0,
      "breakthru": 0
    },
    {
      "slug": "tester",
      "zh": "测试工程师",
      "realm": "炼气·初期",
      "idx": 0,
      "score": 91,
      "avgScore": 91,
      "tasks": 1,
      "excellent": 0,
      "breakthru": 0
    }
  ]
};
