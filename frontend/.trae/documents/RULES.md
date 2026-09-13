# 项目规则

本项目为安徽移动AICT项目管理系统（toB项目管理系统），技术栈：React 18 + TypeScript + Vite + TailwindCSS + Lucide React。

## 页面布局规则

### 非弹窗内容区宽度规范
- 所有非弹窗页面（业务表单、列表页、录入页、管理页等）的内容区容器必须占满可用宽度
- **禁止**使用 `max-w-*` + `mx-auto` 对内容区进行居中限宽（会在页面两侧造成大片空白）
- 顶层内容容器统一使用 `w-full`，让表单/表格的底框/卡片延伸到整个内容区
- 弹窗（Modal）不受此规则约束，按需设置固定宽度
- 影响范围示例：线索录入、线索列表、商机管理、工单创建、工单查询、共享线索录入/查询等所有业务页面

### 顶部栏 (Header)
- 左侧：中国移动 Logo（图片） + 分隔线 + 系统标题"安徽移动AICT项目管理系统"
- 右侧：帮助按钮 + 用户信息下拉菜单

### 左侧菜单 (Sider)
- 支持 2-3 级菜单
- 三级菜单前的图标要和二级菜单的图标不一样（二级用实心圆点，三级用更小的圆环），保持美观
- 系统初始化时，菜单默认展开第一个一级菜单，其他全部合住
- 菜单点击要支持页面跳转
- 菜单展开/收起不能影响内容区、待办区域、常用功能区、系统公告区的高度

### 内容区域
- 不再单独显示页面标题（如"线索录入"），页面名字由多开窗口标签栏展示
- 多开窗口位于内容区域第一行
- 默认展示工作台（待办 + 常用功能 + 系统公告）

## 业务功能规则

### 线索录入页
- 表单布局：两列式排版 + 白色卡片 shadow-sm
- **字段标签与输入框放在同一行**（label 右对齐，固定宽度 96px，input 占剩余空间），节省纵向空间
- 必填项标红色 *
- 字段：
  - 线索归属地市（下拉，默认省公司，含安徽地市）
  - 线索归属区县（下拉，占位"请选择"，非必填）
  - 客户名称（输入框 + 右侧弹窗选择图标）
  - 客户联系人、联系电话（选择客户后自动带出，可修改）
  - 保密级别（单选按钮组：普通/保密，默认普通）
  - 预算金额（数字输入框 + "万元"单位，非必填，**输入时显示中文大写金额，单位是"万元"，不要除以10000**）
  - 线索描述（通栏多行文本域）
- 按钮：重置（白底蓝边） + 提交（#1677FF蓝实底白字），底部居中
- 前端校验：所有*必填项为空时点击提交阻止提交并提示

### 常用功能 (QuickActions)
- 支持收藏/最近使用两个 Tab
- **收藏里支持取消收藏功能**（非自定义项显示黄色星号按钮）
- 收藏 Tab 显示自定义添加按钮（+）
- 最近使用 Tab 每个 item 右上角显示收藏按钮，点击可添加到收藏
- **线索录入功能放在常用功能第一个位置**

## 代码规范

- 不要在业务组件中显示页面大标题，依赖多开窗口标签展示
- 避免 any 类型（遗留代码除外）
- 所有图片资源放 public/ 目录

## 数字输入规范

所有金额/数值类输入字段统一使用以下规范（**禁止**使用 `type="number"`）：

- input 类型：`type="text"` + `inputMode="decimal"`，确保连续输入不丢焦
- 引入工具函数：`@/lib/utils` 的 `sanitizeAmountInput` 和 `formatToTwoDecimals`
  - `sanitizeAmountInput(value)`：清洗输入，只允许数字和一个小数点
  - `formatToTwoDecimals(value)`：失焦后格式化为保留两位小数的字符串
- onChange：调用 `sanitizeAmountInput` 清洗
- onBlur：调用 `formatToTwoDecimals` 格式化
- 占位符：统一 `请填写（大于0）`
- 单位后缀：放在右侧的 `absolute` 定位 span 中（`万元`/`元` 等）

## 表单必填规范

- 业务录入页面的"客户信息"和"基本信息"等核心区，**所有可编辑字段**都应标记为 `required`（带红色星号）
- 不可编辑的 readonly 字段（auto-populated、显示用）不标记
- FieldRow 统一传入 `required` 和 `error` props，由组件统一渲染红星和错误提示
- 提交时统一在 handleSubmit 中遍历校验，`alert` 提示并标红

## 商机等级自动联动

- 预估金额变化时，调用 `getBusinessLevel(amount)` 自动更新 `form.businessLevel`
- 不需要用户手动调整等级，但 UI 仍展示单选框允许手动覆盖
- 商机等级说明使用 `\n` 换行，InfoTip 容器加 `whitespace-pre-line`

## 列表/表格样式规范

### 操作列（必须固定在右侧）
所有列表/表格页面的「操作」列统一使用以下规范：

- **表头（th）**：`sticky right-0 bg-gray-50`（与表头背景色一致）
- **单元格（td）**：`sticky right-0 bg-white`（与行背景色一致，悬停时需注意与 `hover:bg-gray-50` 配合）
- 操作列建议加 `z-10` 确保层级在普通单元格之上
- 操作列宽度根据按钮数量自适应，建议 `min-w-[180px]`

### 操作按钮样式
- 纯文本按钮（不带图标），统一蓝色
- 容器：`flex items-center gap-3 text-blue-600`
- 单个按钮：`hover:text-blue-800 hover:underline`
- 多个操作按钮之间用 `gap-3` 间隔
- 不要再使用多色（红/橙/绿/紫）的图标按钮风格

### 状态徽标
- 圆角小标签：`px-2 py-0.5 text-xs rounded`
- 商机状态配色：审核中=蓝、处理中=橙、已立项=绿、已废弃=灰、已关闭=红
- 商机等级配色：S=红、A=橙、B=蓝、C=青、D=灰

## 工作台业务规则

### 待阅二级 Tab
- 一级 Tab「待阅」下提供 5 个二级 Tab：`全部`、`审批待阅`、`变更待阅`、`进度待阅`、`其他`
- 每个二级 Tab 后括号内展示该分类下的数量
- 点击二级 Tab 切换列表筛选，列表只展示对应分类的数据
- 分类字段来源：数据中 `readCategory` 字段，取值 `approval` | `change` | `progress` | `other`
- 切换一级 Tab 时，二级 Tab 重置为「全部」

## 视觉设计规范（浅色 B 端商务风格）

### 主色
- **主色（Primary）**：`#1677FF`（与 Tailwind `blue-600` 等价）
- **主色 - 浅**：`bg-blue-50` / `text-blue-600`（徽标、hover 背景等）
- **主色 - 深**：`#1668DD`（按钮 hover 状态）
- 业务数据强调色（仅用于数据徽标/状态）：绿 `text-green-600`、橙 `text-orange-600`、红 `text-red-600`、青 `text-cyan-600`、灰 `text-gray-600`

### 卡片规范
- **圆角**：统一 `rounded-lg`（8px），禁止使用 `rounded-xl`（12px）/ `rounded-2xl`（16px）
- **背景**：`bg-white`
- **阴影**：`shadow-sm`（默认）/ `hover:shadow-md`（可点击卡片 hover 态）
- **内边距**：内容区 `p-4`、紧凑列表区 `p-3`
- **边框**：`border border-gray-200`（需要明确边界时使用，默认纯阴影即可）

### 排版规范
- **3 栏卡片排版**：核心指标卡 / 模块卡使用 3 列网格（`grid grid-cols-3 gap-3`），响应式时切换为 `grid-cols-1`
- **大标题**：组件内不再显示大标题（依赖多开窗口标签展示页面名）

### 节标题规范
所有页面内的「节标题」（如客户信息、商机基本信息、第一责任信息、拓展团队信息等）统一使用以下规范：

- **左侧蓝色竖条**：`w-1 h-4 bg-[#1677FF] rounded-sm`，作为节标题的视觉标识
- **文字**：`text-sm font-semibold text-gray-800`
- **整体结构**：`flex items-center gap-2`，蓝色竖条在前、文字在后
- **伸缩/收起支持**：
  - 节标题必须是可点击的，**默认展开**
  - 收起时该节下所有内容隐藏，只保留节标题
  - 展开/收起切换使用 `useState` 维护 `expanded: boolean`
  - 切换图标（ChevronDown/ChevronRight）**右侧对齐**，点击整个节标题即可切换
  - 提供 `defaultExpanded` prop 以允许在某些场景默认收起
- **示例代码**：
  ```tsx
  <div
    className="flex items-center justify-between gap-2 mb-3 cursor-pointer select-none"
    onClick={() => setExpanded(!expanded)}
  >
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">节标题</h3>
    </div>
    {expanded ? (
      <ChevronDown className="w-4 h-4 text-gray-500" />
    ) : (
      <ChevronRight className="w-4 h-4 text-gray-500" />
    )}
  </div>
  {expanded && <div className="节内容">...</div>}
  ```

### 查询条件样式规范
所有列表/管理页面的「查询条件」区域（卡片）统一使用以下规范（参照 `OpportunityManage.tsx` 商机管理实现）：

- **外层容器**：`bg-white rounded-lg shadow-sm p-4 mb-3`（白底 + 圆角 + 轻阴影 + 16px 内边距 + 下方间距）
- **节标题栏**（带展开/收起功能）：
  - 左侧：「蓝色竖条 + 文字」组合（`flex items-center gap-2`）
    - 蓝色竖条：`w-1 h-4 bg-[#1677FF] rounded-sm`
    - 文字：`text-sm font-semibold text-gray-800`，统一文案「查询条件」
  - 右侧：「展开/收起」文字按钮（`text-xs text-blue-600 hover:text-blue-700`）
  - 中间（可选）：ChevronDown/ChevronRight 图标与左侧文字组对齐
  - **默认收起**（与节标题默认展开相反）
  - 整行可点击切换状态，文字按钮 `e.stopPropagation()` 防止冒泡
- **条件网格**：使用 `grid grid-cols-{3|4} gap-x-6 gap-y-3`，3 列或 4 列根据条件数量自适应
  - 推荐 4 列（条件数 ≥ 10 时），3 列（条件数 < 10 时）
- **字段标签**：`block text-sm text-gray-700 mb-1`（与商机管理保持一致）
- **输入框**：`w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500`
- **下拉框**：`... bg-white`（在输入框基础上加 `bg-white`）
- **重置/查询按钮栏**：
  - 容器：`flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100`
  - 重置按钮：`px-4 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50`
  - 查询按钮：`px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD]`
- **展开/收起行为**：
  - 默认收起：仅展示前 2 行（6 个或 8 个）核心查询条件
  - 展开后：显示全部条件
  - 收起时被隐藏的条件用 `{filterExpanded && (<>...</>)}` 包裹
- **示例代码**：
  ```tsx
  <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
    <div
      className="flex items-center justify-between mb-3 cursor-pointer select-none"
      onClick={() => setFilterExpanded(v => !v)}
    >
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">查询条件</h3>
        {filterExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setFilterExpanded(v => !v) }}
        className="text-xs text-blue-600 hover:text-blue-700"
      >
        {filterExpanded ? '收起' : '展开'}
      </button>
    </div>
    <div className="grid grid-cols-4 gap-x-6 gap-y-3">
      {/* 默认展示前 2 行（8 个）查询条件 */}
      {/* ... */}
      {filterExpanded && (
        <>
          {/* 展开后展示的剩余条件 */}
        </>
      )}
    </div>
    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
      <button type="button" onClick={handleReset} className="px-4 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1.5">
        <RotateCcw className="w-4 h-4" />
        重置
      </button>
      <button type="button" onClick={handleSearch} className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] flex items-center gap-1.5">
        <Search className="w-4 h-4" />
        查询
      </button>
    </div>
  </div>
  ```

### 背景层级
视觉层级遵循「页面 → 卡片 → 内容」的浮起关系，背景色由外到内依次区分：

| 层级 | 用途 | 样式 |
| --- | --- | --- |
| 页面背景 | 最外层、菜单栏/工作台容器 | `bg-gray-50` |
| 卡片/面板 | 在页面背景之上浮起的内容块 | `bg-white` + `shadow-sm` + `rounded-lg` |
| 表格头 / 分组底 | 表头行、列表分组底部 | `bg-gray-50` |
| 只读输入框 | 系统自动带出、不可编辑的字段 | `bg-gray-50 border border-gray-200` |

- 禁止把页面背景直接涂成纯白，会让卡片失去「浮起」感
- readonly 字段一律使用灰底（`bg-gray-50`）与可编辑字段做明显区分，不要使用 `disabled` + `opacity` 弱化样式
- 表格头必须使用 `bg-gray-50`（而不是 `bg-white`），与白色行底形成清晰对比

### 整体风格
- **浅色 B 端商务**：白底为主、克制的彩色、清晰的层级、留白充足
- **交互反馈**：hover 颜色变化、按钮 active 态、loading 态
- **圆角统一**：除头像/标签 chip 可用 `rounded-full` 外，所有 UI 元素统一 `rounded-lg`
