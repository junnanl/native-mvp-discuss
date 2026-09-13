# CMI_AH 项目规则（AGENTS.md）

本文件定义项目中跨页面/跨模块必须遵守的统一规范。AI 助手在生成或修改代码时请严格遵守。

---

## 一、流程信息卡片规范

> 适用于所有"流程信息"类卡片（商机录入、售前支撑处理、预决策、招投标 等）

**统一格式**：
- 卡片标题：「流程信息」
- 字段：固定 2 个字段，**两列**布局（`grid grid-cols-2`）
  - 字段 1：`下一步环节`（label 名固定）
  - 字段 2：`下一步处理人`（label 名固定）
- 字段排版：使用 32px label 右对齐 + 内容区（参考商机录入 `FieldRow` 风格）
- 内容区样式：
  - 静态展示（无选择）：`px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700`
  - 可选择（如处理人选择）：`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white`
- 「下一步环节」通常为**只读文本**（系统按流程自动流转）
- 「下一步处理人」统一使用**人员选择框** `<PersonPicker />`（@/components/PersonPicker），禁止用原生 `<select>`
  - 触发器外观与原 select 等宽：`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white`
  - 点击展开下拉面板，顶部搜索框（按姓名 / 部门模糊匹配），列表项展示「彩色圆形头像 + 姓名 + 部门」
  - 点击列表项或外部 / Esc 关闭
- 标题栏前必须有蓝色短竖线：`w-1 h-4 bg-[#1677FF] rounded-sm`

**示例代码**（以商机录入为准）：

```tsx
{/* ========== 流程信息 ========== */}
<div className="mt-5 pt-4 border-t border-gray-100">
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
    <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
  </div>
  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
    <div>
      <div className="flex items-center min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
        <div className="flex-1 min-w-0">
          <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {nextNode}
          </div>
        </div>
      </div>
    </div>
    <div>
      <div className="flex items-center min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
        <div className="flex-1 min-w-0">
          <PersonPicker
            value={selectedNextHandler}
            onChange={setSelectedNextHandler}
            options={handlerList}   // { id, name, dept }[]
            placeholder="请选择下一步处理人"
          />
        </div>
      </div>
    </div>
  </div>
</div>
```

**禁止事项**：
- ❌ 字段名不统一（如用「下一环节」/「处理人」/「转交人」等）
- ❌ 流程信息放在非 mt-5 pt-4 border-t 区域
- ❌ 字段排版不统一（如 label 不右对齐、宽度不一致）
- ❌ 「下一步处理人」使用原生 `<select>`（必须用 `<PersonPicker />`）

---

## 二、卡片标题与展开/收起规范

**SectionTitle 风格**（用于客户信息、商机信息、商机评估信息 等大区块）：

```tsx
<div
  className="flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
  onClick={() => sectionKey && toggleSection(sectionKey)}
>
  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
  <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
  {sectionKey && (
    expanded
      ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
      : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
  )}
  {extra && (
    <div className="ml-auto flex items-center" onClick={(e) => e.stopPropagation()}>{extra}</div>
  )}
</div>
```

- 标题文字 + 蓝色短竖线（`w-1 h-4 bg-[#1677FF] rounded-sm`）
- 整行可点击切换展开/收起
- 右侧展示 `ChevronDown` / `ChevronRight` 图标
- 区块之间用 `mt-5 pt-4 border-t border-gray-100` 分隔

**展开/收起默认值约定**：
- 客户信息、商机信息 等**辅助/只读信息** → **默认收起**（`expanded: false`）
- 业务必填信息（如商机录入的客户信息）→ 默认展开

---

## 三、字段排版规范（FieldRow）

用于所有"label + 输入控件"组合：

- label 宽度：`w-32`（即 128px），右对齐
- label 必填星号：`<span className="text-red-500 mr-0.5">*</span>`
- 控件最小高度：`min-h-[36px]`
- 错误提示：`text-xs text-red-500 mt-1`
- 网格布局：2 列 `grid grid-cols-2 gap-x-6 gap-y-3`

---

## 四、按钮区域规范

所有处理/录入页面的**底部按钮区域**统一为：

```tsx
<div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
  <button
    type="button"
    className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
  >
    <RotateCcw className="w-4 h-4" />
    取消
  </button>
  <button
    type="button"
    className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
  >
    <Check className="w-4 h-4" />
    提交
  </button>
</div>
```

- 居中布局 `flex justify-center`
- 取消按钮：白底蓝边蓝字 + `RotateCcw` 图标
- 提交按钮：主色蓝底白字 + `Check` 图标
- 上下分割线：`mt-6 pt-4 border-t border-gray-100`

**禁止在页面顶部放置"开始处理"/"保存草稿"等动作按钮**（用户视角：所有动作在底部统一收口）。

---

## 五、导航规范

- 路由切换使用 `onNavigate: (path: string) => void` props 模式（项目未使用 react-router-dom）
- 菜单跳转、新窗口跳转、组件内跳转统一走 `onNavigate`

---

## 六、待办/列表规范

- 待办标题一律为蓝色超链接（`text-[#1677FF] hover:underline`），点击触发对应处理页跳转
- 列表项的"处理"/"查看"/"查阅"按钮也通过 `onNavigate` 跳转
- 分页：每页 10 条

---

## 七、图标库

统一使用 `lucide-react`，禁止混用其他图标库。

---

## 八、颜色规范

- 主色：`#1677FF`（蓝色）
- 主色浅色（hover/选中）：`#4096FF`
- 主色按下：`#1668DD`
- 危险：红色 `text-red-500` / `border-red-500`
- 成功：绿色 `text-green-600`
- 警告：橙色 `text-orange-600`
- 文本主色：`text-gray-800`
- 文本次色：`text-gray-500` / `text-gray-600`
- 文本弱化：`text-gray-400`
- 分割线：`border-gray-100` / `border-gray-200`

---

## 九、目录结构

```
src/
├── components/        # 通用组件（如 ProjectFlowNav, TodoList 等）
├── pages/             # 页面
│   ├── Business/      # 业务域（商机、线索、工单）
│   └── My/            # 我的域（待办、项目、合同等）
├── data/              # mock 数据
├── lib/               # 工具函数
└── App.tsx            # 路由 + 主布局
```

---

## 十、项目阶段处理页统一规范

> 适用于所有"项目阶段处理页"：售前支撑处理、预决策、招投标、项目立项、合同签订、合同交底 等。
> 这些页面的整体布局、辅助信息卡、流程导航嵌入、流程信息、按钮区域 **必须完全一致**；仅"业务内容区数据"和"主按钮文案"在不同阶段不同。

### 10.0 页面整体结构（自上而下 4 段）

1. **辅助信息区** —— 客户信息（默认收起）+ 商机信息（默认收起）
2. **业务进展区** —— "商机进展"卡（含 `<ProjectFlowNav embedded />` + 根据 `activeFlowNode` 切换的下方内容）
3. **流程信息卡** —— 严格遵循 §一
4. **按钮区** —— 取消 + `完成{阶段名}`，严格遵循 §四

**外壳**：

```tsx
<div className="h-full overflow-auto bg-gray-50">
  <div className="max-w-[1600px] mx-auto p-3 space-y-3">
    {/* 1. 客户信息（压缩收起） */}
    {/* 2. 商机信息（压缩收起） */}
    {/* 3. 商机进展（流程导航 + 业务内容） */}
    {/* 4. 流程信息 */}
    {/* 5. 按钮区 */}
  </div>
</div>
```

### 10.1 辅助信息卡 - 压缩收起样式

> 客户信息、商机信息默认收起，收起态必须保持高度紧凑（**约 32-36px**），不应占用过多屏幕空间。
> 区别于 §二 的"标准 SectionTitle"（`text-sm`、`h-4`、`py-1`），本节是 **压缩态**，用于辅助信息卡。

**收起态标题栏**：

```tsx
<div className="bg-white rounded-lg shadow-sm">
  <div
    className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-2 rounded-lg"
    onClick={() => toggleSection('customer')}
  >
    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
    <h3 className="text-xs font-semibold text-gray-800">客户信息</h3>
    {expanded
      ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
    }
    {!expanded && (
      <span className="ml-2 text-xs text-gray-400 truncate">
        {customerInfo.name} · {customerInfo.contact} · {customerInfo.phone}
      </span>
    )}
  </div>
  {expanded && (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
        {/* 字段：见 11.2 */}
      </div>
    </div>
  )}
</div>
```

**关键参数**：
- 卡片外层：`bg-white rounded-lg shadow-sm`（**无外边距**，由父级 `space-y-3` 统一控制）
- 标题栏：`px-4 py-2`（**不是** `p-4`）
- 竖条：`w-1 h-3.5`（**不是** `w-1 h-4`）
- 标题：`text-xs font-semibold`（**不是** `text-sm`）
- Chevron：`w-3.5 h-3.5`（**不是** `w-4 h-4`）
- 展开区：`px-4 pb-4 pt-2 border-t border-gray-100`
- 收起态尾部追加一行 `text-xs text-gray-400` 的关键字段摘要

### 10.2 只读字段展示规范（无边框）

> 客户信息、商机信息展开态下的字段全部为**只读展示**。
> **严禁使用带框样式** —— 会让人误以为是可以输入的输入框。

**禁止样式**：
- ❌ `bg-gray-50 border border-gray-200 rounded-md`
- ❌ 任何视觉上像输入控件的容器

**正确样式**（label + 纯文字）：

```tsx
<div className="flex items-center min-h-[36px]">
  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">客户名称</label>
  <div className="flex-1 min-w-0 text-sm text-gray-700">
    {customerInfo.name}
  </div>
</div>
```

> 流程信息卡的"下一步环节"沿用 §一的框样式不变（保持与"可选择控件"视觉一致）。
> 业务录入页（商机录入、合同录入等）需要填写输入框的地方**不在本规范内**，仍按 §三 + 原 AGENTS §一 框样式。

### 10.3 商机进展 - 流程导航嵌入模式

> ProjectFlowNav 在阶段处理页内用作**内容切换器**，节点点击**不跳转新页面**，只切换下方内容。
> （全局默认行为 —— 其他页面传入 `onNavigate` 仍按原方式跳页）

**用法**：

```tsx
const [activeFlowNode, setActiveFlowNode] = useState('pre-support')  // 默认指向本阶段

<ProjectFlowNav
  embedded
  onNodeChange={setActiveFlowNode}
  currentNodeKey={activeFlowNode}
/>

{activeFlowNode === 'pre-support' && <SupportOrdersBlock />}
{/* 其他可见节点：占位 or 实际数据 */}
```

> **商机阶段默认隐藏**：所有项目阶段处理页（售前支撑、预决策、招投标、立项、合同签订、合同交底）**不展示"商机"项目阶段**。组件通过 `hiddenNodes` prop 实现，默认值 `['biz']`，一般无需手动传入。后续新增的项目阶段处理页也**统一不展示商机**。

**默认 `activeFlowNode` 约定**：

| 处理页 | 默认 activeFlowNode |
| --- | --- |
| 售前支撑处理 | `pre-support` |
| 预决策 | `pre-decision` |
| 招投标 | `tender` |
| 项目立项 | `project-init` |
| 合同签订 | `contract-sign` |
| 合同交底 | `contract-brief` |
| 项目启动与规划 | `kickoff` |
| 项目开工 | `start` |

**子分类区块（售前受理信息）通用模式**：
当某一项目阶段下挂多个子分类（如售前支撑下的 6 大支撑类型）时，子分类区块统一按以下样式：

```tsx
<div className="border border-gray-100 rounded-lg bg-white">
  {/* 子标题 + 数量角标 + 新增按钮 */}
  <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
    <div className="flex items-center gap-1.5 text-sm">
      <span className="font-semibold text-gray-800">{子分类名}</span>
      <span className="text-gray-400">【{数量}】</span>
    </div>
    <button className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#1677FF] hover:bg-blue-50 rounded">
      <Plus className="w-3 h-3" />
      {子分类名}申请
    </button>
  </div>
  {/* 表格列表：name / type / expectedDate / handler / status / action */}
</div>
```

### 10.4 按钮文案约定

> 主按钮文案 = `完成{阶段名}`，**不使用"提交"**。

| 处理页 | 按钮文案 |
| --- | --- |
| 售前支撑处理 | 完成售前支撑 |
| 预决策 | 完成预决策 |
| 招投标 | 完成招投标 |
| 项目立项 | 完成立项 |
| 合同签订 | 完成合同签订 |
| 合同交底 | 完成合同交底 |
| 项目启动与规划 | 保存 + 提交（双按钮，含草稿模式） |
| 项目开工 | 保存 + 提交（双按钮，含草稿模式） |
| 项目实施 | 完成项目实施 |

> **项目启动与规划 / 项目开工 特例**：支持「保存草稿 + 提交」双按钮（取消 + 保存 + 提交），允许填报人分多次录入。其余阶段统一为「取消 + 完成XX」单主按钮模式。

### 10.5 禁止事项

- ❌ 辅助信息卡（客户信息、商机信息）默认展开
- ❌ 客户信息、商机信息内的字段使用带框样式
- ❌ 流程导航节点点击走 `onNavigate` 跳新页面（在阶段处理页内）
- ❌ 主按钮用「提交」「保存」「确认」等通用文案
- ❌ 辅助信息卡外层使用 `mt-5 pt-4 border-t`（间距由父级 `space-y-3` 统一控制）

---

## 十一、详情页规范（工单详情 / 支撑详情等只读详情页）

> 适用于支撑工单详情、流程详情 等**只有"查看"诉求**的详情页（**不**适用于处理页/录入页）。

**结构**（自上而下）：

1. **顶部返回条**：返回按钮 + 标题 + 状态标签
2. **基本信息卡**：工单编号/名称/类型/期望完成时间/处理人/发起人/发起时间/状态/说明
3. **关键字段卡**（按业务类型条件渲染）
4. **流程轨迹卡**：左侧时间线
5. **底部按钮区**：返回按钮

**外壳**：

```tsx
<div className="h-full overflow-auto bg-gray-50">
  <div className="max-w-[1400px] mx-auto p-3 space-y-3">
    {/* 顶部返回条 */}
    <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>
      <div className="w-px h-4 bg-gray-200" />
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h2 className="text-sm font-semibold text-gray-800">{标题}</h2>
        <span className="状态胶囊">状态</span>
      </div>
    </div>
    {/* 基本信息卡 */}
    {/* 关键字段卡（可选） */}
    {/* 流程轨迹卡 */}
    {/* 底部按钮区 */}
  </div>
</div>
```

**基本信息卡字段**（参考）：
- 工单编号 / 工单名称 / 类型
- 期望完成时间 / 当前处理人员
- 发起人 / 发起时间
- 当前状态
- 支撑说明（可选，可占两列）

**关键字段卡**：
- 用于展示该业务类型特有的关键字段（如技术方案支撑的"签约模式/服务内容/技术方案"）
- 不存在时整卡不渲染
- 附件类字段配 `<Paperclip />` 图标 + 蓝色高亮

**流程轨迹卡样式**（时间线）：

```tsx
<div className="bg-white rounded-lg shadow-sm p-4">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
    <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
    <span className="text-xs text-gray-400 ml-1">共 {trail.length} 步</span>
  </div>
  <div className="relative pl-6">
    {/* 竖线 */}
    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
    <ol className="space-y-4">
      {trail.map((item, idx) => (
        <li key={idx} className="relative">
          {/* 圆点：最新一步用主色实心，其他用白色 + 灰边 */}
          <div className={clsx(
            'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
            idx === trail.length - 1
              ? 'bg-[#1677FF] border-[#1677FF]'
              : 'bg-white border-gray-300'
          )} />
          <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
          <div className="text-sm text-gray-800">
            <span className="font-medium">{item.actor}</span>
            <span className="text-gray-500 ml-1.5">{item.action}</span>
          </div>
        </li>
      ))}
    </ol>
  </div>
</div>
```

**禁止事项**：
- ❌ 详情页主按钮用「提交」「保存」等动作型文案（详情页只展示，不操作）
- ❌ 流程轨迹圆点全部同色（必须区分"最新"和"历史"）
- ❌ 详情页用 `bg-white rounded-lg shadow-sm p-4` 外层 `space-y-3` 之外的间距体系

---

## 十二、常见错误规避

- ❌ 不要在主页面顶部放"开始处理"按钮
- ❌ 不要在路由判断中用 `if (path.startsWith(...)) return` 提前 return，导致后续代码不执行
- ❌ 字段名要保持统一（如 "下一步环节" / "下一步处理人" 不能写成 "下一环节" / "处理人"）
- ❌ 待办标题不要用普通灰色文字，必须蓝色超链接
- ❌ 不要在卡片标题前用其他颜色短竖线，必须 `bg-[#1677FF]`
- ❌ 客户信息、商机信息展开态字段不要用 `bg-gray-50 border border-gray-200 rounded-md` 框样式（参考 §10.2）
- ❌ 项目阶段处理页内不要让流程导航节点跳新页面（参考 §10.3）
- ❌ 主按钮不要用「提交」/「保存」/「确认」等通用文案，参考 §10.4 使用 `完成{阶段名}`

---

最后更新：2026-06-11
