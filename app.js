/**
 * @file    app.js
 * @brief   交互式 demo 交互逻辑——展厅 + 模拟器(8 阶段向导)
 * @author  developer | 项目: self-intro | Phase 2 · T9
 * @date    2026-08-12
 *
 * @details
 * 本文件为 T8(ui-designer)界面骨架绑定交互逻辑:
 *   - 展厅(view-gallery):tab 切换 + 内容面板渲染 + 7 部门卡片点击展开岗位列表
 *   - 模拟器(view-simulator):读取 DEMO_DATA.simulator.steps 渲染 8 阶段向导
 *     (进度条 + 步骤卡 + 操作区 + 上一步/下一步/重置);
 *     第 8 步结尾显示交付完成状态;
 *     验收步(第 6 步)模拟「自动化检查 → AI 验收 → 人类批准」三层点击流,三层全过显示「通过」。
 *   - 数据绑定:读取 window.DEMO_DATA(data.js),数据缺失时给出可见错误提示(不静默)。
 *   - 边界:重置/重开恢复正常;重复点击幂等不报错;未选择点「下一步」给可见提示。
 *   - 内建 smoke 自检:URL 含 ?smoke=1 时自动按序执行全流程,结果追加到 #smoke-report,
 *     供 tester 用 Edge headless --dump-dom 抓取。
 *
 * 依赖:
 *   调用链: index.html → data.js(定义 window.DEMO_DATA)→ app.js(本文件)
 *
 * @note
 *   - 脚本必须在 data.js 之后加载(见 index.html 挂载顺序注释)。
 *   - smoke 不依赖真实浏览器事件,直接调用内部函数,可在 headless 环境同步执行。
 */
(function () {
    'use strict';

    // =====================================================================
    // 常量
    // =====================================================================
    var VIEW_GALLERY = 'gallery';        // 展厅视图 id
    var VIEW_SIMULATOR = 'simulator';    // 模拟器视图 id
    var TOTAL_STEPS = 8;                 // 流水线阶段数(与 DEMO_DATA.simulator.steps 一致)
    var ACCEPT_LAYERS = [                // 验收步三层(顺序点击流,与 CONTEXT.md 措辞一字不差)
        '第 1 层 自动化检查',
        '第 2 层 AI 验收',
        '第 3 层 人类批准'
    ];

    // =====================================================================
    // 运行态
    // =====================================================================
    var data = null;                     // window.DEMO_DATA 引用(loadData 成功后赋值)
    var state = {
        currentView: VIEW_GALLERY,       // 当前主视图(gallery/simulator)
        activeTabId: '',                 // 展厅当前 tab id
        simStep: 1,                      // 模拟器当前步(1..8)
        simPicked: {},                   // 模拟器每步已选选项: { stepNo: optionLabel }
        acceptDone: [],                  // 验收步(第 6 步)已完成的三层 label(顺序)
        simDone: false                   // 第 8 步结束后的「交付完成」态
    };

    // =====================================================================
    // DOM 工具
    // =====================================================================

    /**
     * @brief 便捷选择器(返回首个匹配元素)
     * @param {string} sel CSS 选择器
     * @return {HTMLElement|null}
     */
    function qs(sel) {
        return document.querySelector(sel);
    }

    /**
     * @brief 便捷创建元素
     * @param {string} tag 标签名
     * @param {string=} cls 类名(可空)
     * @param {string=} text 文本内容(可空)
     * @return {HTMLElement}
     */
    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) { node.className = cls; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    /**
     * @brief 判断是否非空数组
     * @param {*} v 待判断值
     * @return {boolean} true 为非空数组
     */
    function isNonEmptyArray(v) {
        return Array.isArray(v) && v.length > 0;
    }

    /**
     * @brief 按 label 在步骤 options 中查找选项
     * @param {Object} step simulator.steps 中一项
     * @param {string} label 选项 label
     * @return {Object|null} 找到的选项或 null
     */
    function findOption(step, label) {
        if (!isNonEmptyArray(step.options)) { return null; }
        for (var i = 0; i < step.options.length; i++) {
            if (step.options[i].label === label) { return step.options[i]; }
        }
        return null;
    }

    // =====================================================================
    // 数据加载与错误提示(铁律:不静默)
    // =====================================================================

    /**
     * @brief 显示数据缺失错误(可见、可定位,绝不静默)
     * @param {string} msg 错误描述
     * @note 在 #app 顶部插入红色错误条,并在两个视图容器内写入错误文本。
     */
    function showError(msg) {
        var appEl = qs('#app');
        if (appEl) {
            var err = el('div', 'demo-error', '⚠ 数据加载失败: ' + msg);
            err.style.cssText =
                'margin:14px 0;padding:12px 16px;border:1px solid #DC2626;' +
                'background:#FEF2F2;color:#DC2626;border-radius:8px;font-weight:700;';
            appEl.insertBefore(err, appEl.firstChild);
        }
        var gv = qs('#view-gallery');
        var sv = qs('#view-simulator');
        if (gv) {
            gv.appendChild(el('p', 'demo-error-text', '⚠ 数据加载失败: ' + msg));
        }
        if (sv) {
            sv.appendChild(el('p', 'demo-error-text', '⚠ 数据加载失败: ' + msg));
        }
    }

    /**
     * @brief 校验并读取 window.DEMO_DATA
     * @return {boolean} true 数据可用;false 存在缺失(已给出错误提示)
     */
    function loadData() {
        if (!window.DEMO_DATA || typeof window.DEMO_DATA !== 'object') {
            showError('window.DEMO_DATA 缺失(data.js 未加载或被覆盖)');
            return false;
        }
        if (!isNonEmptyArray(window.DEMO_DATA.gallery)) {
            showError('DEMO_DATA.gallery 缺失或为空');
            return false;
        }
        if (!window.DEMO_DATA.simulator ||
            !isNonEmptyArray(window.DEMO_DATA.simulator.steps) ||
            window.DEMO_DATA.simulator.steps.length < TOTAL_STEPS) {
            showError('DEMO_DATA.simulator.steps 缺失、为空或不足 8 步');
            return false;
        }
        if (!isNonEmptyArray(window.DEMO_DATA.departments)) {
            showError('DEMO_DATA.departments 缺失或为空');
            return false;
        }
        data = window.DEMO_DATA;
        return true;
    }

    // =====================================================================
    // 主视图切换(展厅 / 模拟器)
    // =====================================================================

    /**
     * @brief 切换主视图(展厅/模拟器),同步更新 nav 按钮与视图显隐
     * @param {string} view VIEW_GALLERY 或 VIEW_SIMULATOR
     * @note 幂等:重复切换同一视图不产生副作用。
     */
    function switchView(view) {
        if (view !== VIEW_GALLERY && view !== VIEW_SIMULATOR) { return; }
        state.currentView = view;
        var gv = qs('#view-gallery');
        var sv = qs('#view-simulator');
        var btnG = qs('#nav-gallery');
        var btnS = qs('#nav-simulator');
        if (gv) {
            gv.classList.toggle('is-active', view === VIEW_GALLERY);
            gv.hidden = view !== VIEW_GALLERY;
        }
        if (sv) {
            sv.classList.toggle('is-active', view === VIEW_SIMULATOR);
            sv.hidden = view !== VIEW_SIMULATOR;
        }
        if (btnG) {
            btnG.classList.toggle('is-active', view === VIEW_GALLERY);
            btnG.setAttribute('aria-selected', view === VIEW_GALLERY ? 'true' : 'false');
        }
        if (btnS) {
            btnS.classList.toggle('is-active', view === VIEW_SIMULATOR);
            btnS.setAttribute('aria-selected', view === VIEW_SIMULATOR ? 'true' : 'false');
        }
    }

    // =====================================================================
    // 展厅:tab 切换 + 内容面板 + 部门网格
    // =====================================================================

    /**
     * @brief 渲染展厅 tab 列表(DEMO_DATA.gallery)
     */
    function renderTabs() {
        var host = qs('#gallery-tabs');
        if (!host) { return; }
        host.innerHTML = '';
        data.gallery.forEach(function (item) {
            var btn = el('button', 'g-tab', item.title);
            btn.type = 'button';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('data-tab', item.id);
            btn.addEventListener('click', function () { selectTab(item.id); });
            host.appendChild(btn);
        });
    }

    /**
     * @brief 选中展厅某 tab(高亮 + 渲染面板 + 按需渲染部门网格)
     * @param {string} tabId DEMO_DATA.gallery 中某项的 id
     */
    function selectTab(tabId) {
        var item = null;
        data.gallery.forEach(function (g) {
            if (g.id === tabId) { item = g; }
        });
        if (!item) { return; }
        state.activeTabId = tabId;

        // tab 高亮
        var tabs = document.querySelectorAll('#gallery-tabs .g-tab');
        Array.prototype.forEach.call(tabs, function (btn) {
            var on = btn.getAttribute('data-tab') === tabId;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        // 内容面板
        renderPanel(item);

        // 部门网格(组织架构 tab 特有)
        var grid = qs('#org-grid');
        if (grid) {
            if (item.showDepartments) { renderDepartments(); }
            else { grid.innerHTML = ''; }
        }
    }

    /**
     * @brief 渲染展厅内容面板(标题/描述/要点列表)
     * @param {Object} item gallery 中一项
     */
    function renderPanel(item) {
        var host = qs('#gallery-panels');
        if (!host) { return; }
        host.innerHTML = '';
        var panel = el('article', 'g-panel');
        panel.setAttribute('data-panel', item.id);
        panel.appendChild(el('h2', null, item.title));
        panel.appendChild(el('p', 'g-desc', item.desc));
        var ul = el('ul', 'g-detail');
        if (isNonEmptyArray(item.detail)) {
            item.detail.forEach(function (line) {
                ul.appendChild(el('li', null, line));
            });
        }
        panel.appendChild(ul);
        host.appendChild(panel);
    }

    /**
     * @brief 渲染 7 部门卡片网格(DEMO_DATA.departments)
     */
    function renderDepartments() {
        var grid = qs('#org-grid');
        if (!grid) { return; }
        grid.innerHTML = '';
        data.departments.forEach(function (dept) {
            grid.appendChild(buildDeptCard(dept));
        });
    }

    /**
     * @brief 构建单个部门卡片(含可点击展开的岗位列表)
     * @param {Object} dept DEMO_DATA.departments 中一项
     * @return {HTMLElement} 部门卡片元素
     */
    function buildDeptCard(dept) {
        var card = el('article', 'dept-card');
        card.setAttribute('data-dept', dept.name);
        card.tabIndex = 0; // 可键盘聚焦
        card.setAttribute('aria-expanded', 'false');
        card.style.setProperty('--dept-color', dept.color || '#4F46E5');

        // 卡片头部:色点 + 部门名 + 特殊部门标签 + 展开箭头
        var head = el('div', 'dept-head');
        head.appendChild(el('span', 'dept-dot'));
        head.appendChild(el('span', 'dept-name', dept.name));
        if (dept.mountRule) {
            head.appendChild(el('span', 'dept-special-tag', '特殊部门'));
        }
        head.appendChild(el('span', 'dept-arrow', '▾'));
        card.appendChild(head);

        card.appendChild(el('p', 'dept-desc', dept.desc));

        // 执行能力行
        var cap = el('p', 'dept-cap');
        cap.appendChild(el('span', 'cap-label', '执行能力 '));
        cap.appendChild(document.createTextNode(dept.cap || ''));
        card.appendChild(cap);

        // 特殊部门挂载规则行
        if (dept.mountRule) {
            card.appendChild(el('p', 'dept-mount', dept.mountRule));
        }

        // 岗位列表(默认隐藏,.open 时展开)
        var roles = el('div', 'dept-roles');
        if (isNonEmptyArray(dept.roles)) {
            dept.roles.forEach(function (role) {
                var r = el('div', 'dept-role');
                var title = el('div', 'r-title', role.zh || role.name);
                title.appendChild(el('span', 'r-slug', role.name));
                r.appendChild(title);
                r.appendChild(el('p', 'r-desc', role.desc || ''));
                roles.appendChild(r);
            });
        }
        card.appendChild(roles);

        // 点击/回车展开收起(重复点击幂等,不报错)
        card.addEventListener('click', function () { toggleDept(card); });
        card.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                toggleDept(card);
            }
        });
        return card;
    }

    /**
     * @brief 展开/收起部门卡片岗位列表
     * @param {HTMLElement} card .dept-card 元素
     * @param {boolean=} forceOpen 可选:强制展开(true)/收起(false)/切换(缺省)
     */
    function toggleDept(card, forceOpen) {
        if (!card || !card.classList.contains('dept-card')) { return; }
        var open = forceOpen === undefined ? !card.classList.contains('open') : !!forceOpen;
        card.classList.toggle('open', open);
        card.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    // =====================================================================
    // 模拟器:8 阶段向导
    // =====================================================================

    /**
     * @brief 渲染模拟器全部区域(进度条/计数/步骤卡/操作区/结果区/控制)
     */
    function renderSim() {
        var steps = data.simulator.steps;
        var step = steps[state.simStep - 1];

        // 进度条
        var fill = qs('#sim-progress-fill');
        if (fill) { fill.style.width = (state.simStep / steps.length * 100) + '%'; }
        var bar = qs('#sim-progress');
        if (bar) { bar.setAttribute('aria-valuenow', String(state.simStep)); }

        // 步计数
        var counter = qs('#sim-counter');
        if (counter) {
            counter.textContent = '第 ' + state.simStep + ' / ' + steps.length + ' 步 · ' + step.title;
        }

        // 步骤卡(交付完成态显示完成卡)
        var stepHost = qs('#sim-step');
        if (stepHost) {
            stepHost.innerHTML = '';
            if (state.simDone) {
                var doneCard = el('article', 'sim-step');
                doneCard.appendChild(el('span', 'step-no', '交付完成'));
                doneCard.appendChild(el('h3', null, 'STATUS.md 已置为已交付'));
                doneCard.appendChild(el('p', 'step-desc',
                    '8 阶段流水线从想法走到完整结果。交付物已进 deliverable/,项目知识已入库,经验沉淀进 lessons/。'));
                stepHost.appendChild(doneCard);
            } else {
                stepHost.appendChild(buildStepCard(step));
            }
        }

        renderSimStepBody();
        updateControls();
    }

    /**
     * @brief 渲染模拟器「当前步主体」:操作区 + 结果区(不重画进度/计数)
     */
    function renderSimStepBody() {
        var steps = data.simulator.steps;
        var step = steps[state.simStep - 1];
        var optHost = qs('#sim-options');
        if (state.simDone) {
            if (optHost) { optHost.innerHTML = ''; }
            renderDoneSummary();
        } else {
            if (optHost) {
                optHost.innerHTML = '';
                if (state.simStep === 6) { buildAcceptOptions(optHost); }
                else { buildNormalOptions(optHost, step); }
            }
            renderResult(step);
        }
        updateControls();
    }

    /**
     * @brief 构建当前步的步骤卡(编号/标题/说明/动作)
     * @param {Object} step simulator.steps 中一项
     * @return {HTMLElement}
     */
    function buildStepCard(step) {
        var card = el('article', null);
        card.appendChild(el('span', 'step-no', '第 ' + step.no + ' 步'));
        card.appendChild(el('h3', null, step.title));
        card.appendChild(el('p', 'step-desc', step.desc));
        var act = el('div', 'step-action');
        act.appendChild(el('span', 'act-label', '要做什么 '));
        act.appendChild(document.createTextNode(step.action || ''));
        card.appendChild(act);
        return card;
    }

    /**
     * @brief 渲染普通步操作选项(可点选,选中即高亮)
     * @param {HTMLElement} host #sim-options
     * @param {Object} step 当前步
     */
    function buildNormalOptions(host, step) {
        if (!isNonEmptyArray(step.options)) { return; }
        var picked = state.simPicked[step.no];
        step.options.forEach(function (opt) {
            var btn = buildOptionBtn(opt, picked === opt.label, false);
            btn.addEventListener('click', function () {
                pickOption(step.no, opt.label, opt.good, opt.note);
            });
            host.appendChild(btn);
        });
    }

    /**
     * @brief 构建单个操作选项按钮
     * @param {Object} opt 选项 {label, good, note}
     * @param {boolean} picked 是否已选中
     * @param {boolean} locked 是否锁定(验收层未解锁)
     * @return {HTMLElement}
     */
    function buildOptionBtn(opt, picked, locked) {
        var btn = el('button', 'sim-opt');
        btn.type = 'button';
        btn.setAttribute('data-opt', opt.label);
        btn.setAttribute('data-good', opt.good ? 'true' : 'false');
        if (picked) {
            btn.classList.add('is-picked');
            btn.classList.add(opt.good ? 'good' : 'bad');
        }
        if (locked) { btn.disabled = true; }
        btn.appendChild(el('span', 'opt-mark', picked ? (opt.good ? '✓' : '✕') : ''));
        var body = el('span', 'opt-body');
        body.appendChild(el('span', 'opt-label', opt.label));
        body.appendChild(el('span', 'opt-note', opt.note || ''));
        btn.appendChild(body);
        return btn;
    }

    /**
     * @brief 选择本步某操作(幂等:重复点同一选项不报错,重绘保持高亮)
     * @param {number} stepNo 步骤号
     * @param {string} label 选项 label
     * @param {boolean} good 是否好选项
     * @param {string} note 选项说明
     */
    function pickOption(stepNo, label, good, note) {
        state.simPicked[stepNo] = label;
        renderSimStepBody();
    }

    /**
     * @brief 验收层说明文本(优先取 data 中第 6 步 options 的 note,避免措辞漂移)
     * @param {number} i 层索引 0..2
     * @return {string}
     */
    function layerNote(i) {
        var st6 = data.simulator.steps[5];
        if (st6 && isNonEmptyArray(st6.options) && st6.options[i] && st6.options[i].note) {
            return st6.options[i].note;
        }
        return '';
    }

    /**
     * @brief 渲染验收步(第 6 步)三层点击流:自动化检查 → AI 验收 → 人类批准
     * @param {HTMLElement} host #sim-options
     * @note 只能依次点击:点完一层解锁下一层;三层全过由结果区显示「通过」。
     */
    function buildAcceptOptions(host) {
        ACCEPT_LAYERS.forEach(function (layer, i) {
            var done = i < state.acceptDone.length;
            var locked = i !== state.acceptDone.length; // 仅当前层可点:已完成层与未解锁层都禁用,防重复点击
            var btn = buildOptionBtn({ label: layer, good: true, note: layerNote(i) }, done, locked);
            btn.addEventListener('click', function () {
                if (i === state.acceptDone.length) {
                    state.acceptDone.push(layer);
                    renderSimStepBody();
                }
            });
            host.appendChild(btn);
        });
    }

    /**
     * @brief 渲染结果区:所选操作反馈 + 本步结果
     * @param {Object} step 当前步
     */
    function renderResult(step) {
        var host = qs('#sim-result');
        if (!host) { return; }
        host.innerHTML = '';
        if (state.simStep === 6) {
            renderAcceptResult(host);
            return;
        }
        var picked = state.simPicked[step.no];
        if (picked) {
            var opt = findOption(step, picked);
            if (opt) {
                var line = el('p');
                line.appendChild(el('span', opt.good ? 'res-good' : 'res-bad',
                    opt.good ? '✓ 选择正确' : '✕ 选择有误'));
                line.appendChild(document.createTextNode(' ' + (opt.note || '')));
                host.appendChild(line);
            }
        } else {
            host.appendChild(el('p', null, '请先选择本步操作,再点「下一步」。'));
        }
        var res = el('p', 'res-neutral');
        res.appendChild(document.createTextNode('本步结果 '));
        res.appendChild(document.createTextNode(step.result || ''));
        host.appendChild(res);
    }

    /**
     * @brief 渲染验收步结果:三层清单 + 全过显示「通过」
     * @param {HTMLElement} host #sim-result
     */
    function renderAcceptResult(host) {
        var list = el('div', 'accept-layers');
        ACCEPT_LAYERS.forEach(function (layer, i) {
            var done = i < state.acceptDone.length;
            var row = el('p');
            row.appendChild(el('span', done ? 'res-good' : 'res-neutral',
                done ? '✓ ' + layer : '· ' + layer));
            list.appendChild(row);
        });
        host.appendChild(list);
        if (state.acceptDone.length === ACCEPT_LAYERS.length) {
            host.appendChild(el('p')).appendChild(el('span', 'res-good', '★ 三层验收全部通过'));
            host.appendChild(el('p', null, '通过 → 打分写入员工 memory.md 绩效,驱动奖赏。'));
        } else {
            host.appendChild(el('p', null, '请依次点击三层:自动化检查 → AI 验收 → 人类批准。'));
        }
    }

    /**
     * @brief 更新向导控制按钮可用态(上一步/下一步/重置)
     */
    function updateControls() {
        var prev = qs('#sim-prev');
        var next = qs('#sim-next');
        var steps = data.simulator.steps;
        if (prev) {
            prev.disabled = state.simDone || state.simStep <= 1;
        }
        if (next) {
            if (state.simDone) {
                next.disabled = true;
                next.textContent = '已完成';
            } else {
                var last = state.simStep >= steps.length;
                next.textContent = last ? '完成交付' : '下一步';
                next.disabled = !isStepReady(steps[state.simStep - 1]);
            }
        }
    }

    /**
     * @brief 判断当前步是否已完成选择、可进入下一步
     * @param {Object} step 当前步
     * @return {boolean}
     */
    function isStepReady(step) {
        if (state.simStep === 6) {
            return state.acceptDone.length === ACCEPT_LAYERS.length;
        }
        return !!state.simPicked[state.simStep];
    }

    /**
     * @brief 结果区提示(未选择时点「下一步」给出可见提示,不报错)
     */
    function showHint() {
        var host = qs('#sim-result');
        if (!host) { return; }
        host.innerHTML = '';
        if (state.simStep === 6) {
            host.appendChild(el('p', null, '请先依次完成三层验收(自动化检查 → AI 验收 → 人类批准)。'));
        } else {
            host.appendChild(el('p', null, '请先选择本步操作,再点「下一步」。'));
        }
    }

    /**
     * @brief 下一步:未选择给提示;第 8 步选择后进入交付完成态
     */
    function goNext() {
        if (state.simDone) { return; }
        var steps = data.simulator.steps;
        var step = steps[state.simStep - 1];
        if (!isStepReady(step)) {
            showHint();
            return;
        }
        if (state.simStep >= steps.length) {
            state.simDone = true;   // 第 8 步走完 → 交付完成态
            renderSim();
        } else {
            state.simStep += 1;
            renderSim();
        }
    }

    /**
     * @brief 上一步(第 1 步或交付完成后禁用)
     */
    function goPrev() {
        if (state.simDone || state.simStep <= 1) { return; }
        state.simStep -= 1;
        renderSim();
    }

    /**
     * @brief 重置模拟器(重开恢复正常:回到第 1 步、清空所有选择)
     */
    function resetSim() {
        state.simStep = 1;
        state.simPicked = {};
        state.acceptDone = [];
        state.simDone = false;
        renderSim();
    }

    /**
     * @brief 渲染第 8 步结束后的「交付完成」总结(各步选择对错统计)
     */
    function renderDoneSummary() {
        var host = qs('#sim-result');
        if (!host) { return; }
        host.innerHTML = '';
        var steps = data.simulator.steps;
        var goodCount = 0;
        var badCount = 0;
        var list = el('div');
        steps.forEach(function (step) {
            var row = el('p');
            if (step.no === 6) {
                var allPass = state.acceptDone.length === ACCEPT_LAYERS.length;
                row.appendChild(el('span', allPass ? 'res-good' : 'res-bad',
                    (allPass ? '✓' : '✕') + ' 验收三层'));
                if (allPass) { goodCount++; } else { badCount++; }
            } else if (state.simPicked[step.no]) {
                var opt = findOption(step, state.simPicked[step.no]);
                var good = opt ? opt.good : false;
                row.appendChild(el('span', good ? 'res-good' : 'res-bad',
                    (good ? '✓' : '✕') + ' ' + step.no + ' ' + step.title));
                if (good) { goodCount++; } else { badCount++; }
            } else {
                row.appendChild(el('span', 'res-bad', '✕ ' + step.no + ' ' + step.title + ' 未选择'));
                badCount++;
            }
            list.appendChild(row);
        });
        host.appendChild(el('p', 'res-neutral', 'STATUS.md 已置为已交付,输出交付总结——从想法到完整结果。'));
        host.appendChild(el('p', null,
            '8 阶段走完: ' + goodCount + ' 步选择正确 / ' + badCount + ' 步待改进。'));
        host.appendChild(list);
    }

    // =====================================================================
    // 事件绑定 + 键盘导航
    // =====================================================================

    /**
     * @brief 绑定导航按钮与向导控制按钮事件
     */
    function bindControls() {
        var navG = qs('#nav-gallery');
        var navS = qs('#nav-simulator');
        if (navG) { navG.addEventListener('click', function () { switchView(VIEW_GALLERY); }); }
        if (navS) { navS.addEventListener('click', function () { switchView(VIEW_SIMULATOR); }); }

        var prev = qs('#sim-prev');
        var reset = qs('#sim-reset');
        var next = qs('#sim-next');
        if (prev) { prev.addEventListener('click', goPrev); }
        if (reset) { reset.addEventListener('click', resetSim); }
        if (next) { next.addEventListener('click', goNext); }
    }

    /**
     * @brief 键盘导航(可选):展厅左右切 tab、Esc 收起部门;模拟器左右切步
     * @param {KeyboardEvent} ev
     * @note 选项/按钮的 Enter 由原生 button 行为处理。
     */
    function onKeydown(ev) {
        var key = ev.key;
        if (state.currentView === VIEW_GALLERY) {
            if (key === 'ArrowRight' || key === 'ArrowLeft') {
                ev.preventDefault();
                var ids = [];
                data.gallery.forEach(function (g) { ids.push(g.id); });
                var idx = ids.indexOf(state.activeTabId);
                if (idx === -1) { return; }
                var next = key === 'ArrowRight' ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
                selectTab(ids[next]);
            } else if (key === 'Escape') {
                // 收起所有展开的部门卡
                document.querySelectorAll('.dept-card.open').forEach(function (c) {
                    toggleDept(c, false);
                });
            }
        } else if (state.currentView === VIEW_SIMULATOR) {
            if (key === 'ArrowRight') { goNext(); }
            else if (key === 'ArrowLeft') { goPrev(); }
        }
    }

    // =====================================================================
    // 内建 smoke 自检(?smoke=1,供 tester 用 Edge headless 抓取)
    // =====================================================================
    var smokePass = 0;
    var smokeFail = 0;

    /**
     * @brief 向 #smoke-report 追加一行(自动创建容器)
     * @param {string} text 行内容
     */
    function smokeLine(text) {
        var host = qs('#smoke-report');
        if (!host) {
            host = el('pre', 'smoke-report');
            host.id = 'smoke-report';
            host.style.cssText =
                'margin:20px 28px;padding:16px;border:1px solid #E4E7F0;border-radius:8px;' +
                'background:#0F172A;color:#E0E7FF;font-family:Consolas,monospace;' +
                'font-size:13px;white-space:pre-wrap;line-height:1.7;';
            document.body.appendChild(host);
        }
        host.appendChild(document.createTextNode(text + '\n'));
    }

    /**
     * @brief 执行单个 smoke 检查,记录 [PASS]/[FAIL]
     * @param {string} name 检查项名
     * @param {Function} fn 断言函数;抛异常或返回 false 视为 FAIL
     */
    function smokeCheck(name, fn) {
        try {
            var ok = fn();
            if (ok === false) { throw new Error('断言失败'); }
            smokePass += 1;
            smokeLine('[PASS] ' + name);
        } catch (err) {
            smokeFail += 1;
            var reason = err && err.message ? err.message : String(err);
            smokeLine('[FAIL] ' + name + ': ' + reason);
        }
    }

    /**
     * @brief 运行完整 smoke 流程(不依赖真实浏览器事件,直接调用内部函数)
     * @note 顺序:数据加载 → 切模拟器 → 逐层跑完 8 阶段(含验收三层)→ 重置恢复
     *       → 切回展厅 → 各 tab 展开详情/部门展开 → 输出 [DONE] n/n passed。
     */
    function runSmoke() {
        smokeLine('=== smoke start ===');

        // 0. 数据加载
        smokeCheck('数据加载 window.DEMO_DATA', function () {
            return !!data &&
                isNonEmptyArray(data.simulator.steps) &&
                data.simulator.steps.length === TOTAL_STEPS &&
                isNonEmptyArray(data.gallery) &&
                isNonEmptyArray(data.departments);
        });

        // 1. 切到模拟器
        smokeCheck('切换主视图 → 模拟器', function () {
            switchView(VIEW_SIMULATOR);
            var sv = qs('#view-simulator');
            return sv && !sv.hidden && sv.classList.contains('is-active');
        });

        // 2. 逐层跑完 8 阶段(每层点操作 / 下一步)
        var steps = data.simulator.steps;
        for (var i = 1; i <= 7; i++) {
            (function (no) {
                var step = steps[no - 1];
                smokeCheck('模拟器 第' + no + ' 步「' + step.title + '」渲染', function () {
                    if (state.simStep !== no) { return false; }
                    var counter = qs('#sim-counter');
                    return counter && counter.textContent.indexOf('第 ' + no + ' / 8') !== -1;
                });
                if (no === 6) {
                    // 验收三层点击流
                    for (var l = 0; l < 3; l++) {
                        (function (li) {
                            smokeCheck('验收层 ' + ACCEPT_LAYERS[li], function () {
                                if (state.simStep !== 6) { return false; }
                                var btn = qs('#sim-options .sim-opt[data-good="true"]:not(:disabled)');
                                if (!btn) { return false; }
                                btn.click();
                                return state.acceptDone.length === li + 1;
                            });
                        })(l);
                    }
                    smokeCheck('验收三层全过 → 下一步', function () {
                        var res = qs('#sim-result');
                        var showedPass = res && res.textContent.indexOf('三层验收全部通过') !== -1;
                        goNext();
                        return showedPass && state.simStep === 7;
                    });
                } else {
                    smokeCheck('模拟器 第' + no + ' 步 选择操作+下一步', function () {
                        var btn = qs('#sim-options .sim-opt[data-good="true"]:not(:disabled)');
                        if (!btn) { return false; }
                        btn.click();   // 选中
                        goNext();      // 下一步
                        return state.simStep === no + 1;
                    });
                }
            })(i);
        }

        // 3. 第 8 步:选择操作 → 交付完成态
        smokeCheck('第8步「交付归档」渲染', function () {
            return state.simStep === 8 && !!qs('#sim-step h3');
        });
        smokeCheck('第8步 选择操作', function () {
            var btn = qs('#sim-options .sim-opt[data-good="true"]:not(:disabled)');
            if (!btn) { return false; }
            btn.click();
            return !!state.simPicked[8];
        });
        smokeCheck('第8步 完成交付状态', function () {
            goNext();
            var stepHost = qs('#sim-step');
            return state.simDone && stepHost && stepHost.textContent.indexOf('交付完成') !== -1;
        });
        smokeCheck('重置后恢复正常(第1步/清空选择)', function () {
            resetSim();
            return state.simStep === 1 && !state.simDone && state.acceptDone.length === 0;
        });

        // 4. 切回展厅,各 tab 展开详情
        smokeCheck('切换主视图 → 展厅', function () {
            switchView(VIEW_GALLERY);
            var gv = qs('#view-gallery');
            return gv && gv.classList.contains('is-active') && !gv.hidden;
        });

        var g = data.gallery;
        for (var t = 0; t < g.length; t++) {
            (function (idx) {
                smokeCheck('展厅 tab「' + g[idx].title + '」渲染详情', function () {
                    selectTab(g[idx].id);
                    var panel = qs('#gallery-panels .g-panel');
                    if (!panel) { return false; }
                    var h2 = panel.querySelector('h2');
                    return h2 && h2.textContent === g[idx].title &&
                        panel.querySelectorAll('.g-detail li').length > 0;
                });
                if (g[idx].showDepartments) {
                    smokeCheck('组织架构 渲染 7 部门卡片', function () {
                        var cards = document.querySelectorAll('#org-grid .dept-card');
                        return cards.length === data.departments.length;
                    });
                    var depts = data.departments;
                    for (var d = 0; d < depts.length; d++) {
                        (function (di) {
                            smokeCheck('部门「' + depts[di].name + '」展开岗位', function () {
                                var cards = document.querySelectorAll('#org-grid .dept-card');
                                var card = cards[di];
                                if (!card) { return false; }
                                toggleDept(card, true);
                                var open = card.classList.contains('open');
                                var hasRoles = card.querySelectorAll('.dept-roles .dept-role').length > 0;
                                toggleDept(card, false);
                                return open && hasRoles;
                            });
                        })(d);
                    }
                }
            })(t);
        }

        // 5. 汇总
        smokeLine('=== [DONE] ' + smokePass + '/' + (smokePass + smokeFail) + ' passed ===');
    }

    // =====================================================================
    // 星空背景(space-bg):星野闪烁 + 旋转星球 + 随机流星
    // 纯 JS/CSS,无外部依赖;尊重 prefers-reduced-motion(静止不闪不划)
    // =====================================================================

    /**
     * @brief 初始化星空背景:生成星野、定位旋转星球、调度随机流星
     * @note 填充 index.html 提供的 #space-bg 三个空容器;装饰层,
     *       pointer-events:none 由 CSS 保证不阻挡交互。
     */
    function initSpaceBg() {
        var bg = qs('#space-bg');
        if (!bg) { return; }
        var reduced = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 1) 星野:约 110 颗随机分布、随机闪烁节奏的星点
        var starsHost = qs('#space-stars');
        if (starsHost) {
            var i;
            for (i = 0; i < 110; i++) {
                var s = el('span', 'star');
                s.style.left = (Math.random() * 100).toFixed(2) + '%';
                s.style.top = (Math.random() * 100).toFixed(2) + '%';
                var size = (Math.random() * 1.6 + 1).toFixed(1);
                s.style.width = size + 'px';
                s.style.height = size + 'px';
                s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
                s.style.animationDuration = (Math.random() * 2.5 + 2.5).toFixed(2) + 's';
                if (Math.random() < 0.12) { s.className = 'star glow'; }
                starsHost.appendChild(s);
            }
        }

        // 2) 旋转星球:3 颗(靛蓝/青/紫),半透明,外层球体+内部条纹慢速自旋
        var planetsHost = qs('#space-planets');
        if (planetsHost && !reduced) {
            var planets = [
                { size: 150, top: '-45px', right: '-40px', hue: 'rgba(99,102,241,.55)', glow: 'rgba(99,102,241,.35)', spin: 52 },
                { size: 96, bottom: '-28px', left: '-26px', hue: 'rgba(34,211,238,.45)', glow: 'rgba(34,211,238,.30)', spin: 38 },
                { size: 58, top: '38%', left: '5%', hue: 'rgba(167,139,250,.40)', glow: 'rgba(167,139,250,.25)', spin: 30 }
            ];
            planets.forEach(function (p) {
                var pl = el('span', 'planet');
                pl.style.width = p.size + 'px';
                pl.style.height = p.size + 'px';
                if (p.top !== undefined) { pl.style.top = p.top; }
                if (p.right !== undefined) { pl.style.right = p.right; }
                if (p.bottom !== undefined) { pl.style.bottom = p.bottom; }
                if (p.left !== undefined) { pl.style.left = p.left; }
                pl.style.setProperty('--pglow', p.glow);
                pl.style.setProperty('--pspin', p.spin + 's');
                pl.style.background = 'radial-gradient(circle at 32% 30%, ' + p.hue +
                    ' 0%, rgba(6,10,30,.92) 68%)';
                planetsHost.appendChild(pl);
            });
        }

        // 3) 随机流星:每约 2.8-5.5 秒从右上划落一颗(首颗延迟 1.8s,reduced-motion 跳过)
        var meteorsHost = qs('#space-meteors');
        if (meteorsHost && !reduced) {
            var spawnMeteor = function () {
                var mt = el('span', 'meteor');
                mt.style.left = (Math.random() * 70 + 10).toFixed(1) + '%';
                mt.style.top = '2%';
                mt.style.animationDuration = (0.9 + Math.random() * 0.5).toFixed(2) + 's';
                meteorsHost.appendChild(mt);
                setTimeout(function () {
                    if (mt.parentNode) { mt.parentNode.removeChild(mt); }
                }, 2200);
            };
            var meteorLoop = function () {
                spawnMeteor();
                var nextMs = Math.floor(Math.random() * 2700 + 2800);
                setTimeout(meteorLoop, nextMs);
            };
            setTimeout(meteorLoop, 1800);
        }
    }

    // =====================================================================
    // 初始化
    // =====================================================================

    /**
     * @brief 应用初始化:校验数据、渲染展厅与模拟器、绑定事件、跑 smoke
     * @note 在 data.js 之后同步执行(脚本位于 body 末尾,DOM 已就绪)。
     */
    function init() {
        if (!loadData()) { return; }   // 数据缺失已给出可见错误,不再绑定
        state.activeTabId = data.gallery[0].id;
        bindControls();
        renderTabs();
        selectTab(state.activeTabId);
        renderSim();
        document.addEventListener('keydown', onKeydown);

        // 页头公司使命:文案来自 DEMO_DATA.brand.mission(缺失则隐藏,不静默占位)
        var missionEl = qs('#site-mission');
        if (missionEl) {
            if (data.brand && data.brand.mission) {
                missionEl.textContent = data.brand.mission;
            } else {
                missionEl.style.display = 'none';
            }
        }

        // 星空背景:星野 + 旋转星球 + 随机流星
        initSpaceBg();

        // 暴露调试 API(供 smoke / tester 直接调用内部函数)
        window.__DEMO = {
            switchView: switchView,
            selectTab: selectTab,
            toggleDept: toggleDept,
            goNext: goNext,
            goPrev: goPrev,
            resetSim: resetSim,
            getState: function () { return state; }
        };

        // 内建 smoke 自检
        var params = new URLSearchParams(window.location.search);
        if (params.get('smoke') === '1') {
            runSmoke();
        }
    }

    init();
})();
