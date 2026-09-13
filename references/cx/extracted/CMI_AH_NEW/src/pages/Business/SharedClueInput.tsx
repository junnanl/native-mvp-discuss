import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, RotateCcw, Check, Upload, X, FileText, Trash2, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { formatToTwoDecimals } from '@/lib/utils'

// 安徽省地市
const cities = [
  { value: 'province', label: '省公司' },
  { value: 'hefei', label: '合肥市' },
  { value: 'wuhu', label: '芜湖市' },
  { value: 'bangbu', label: '蚌埠市' },
  { value: 'huainan', label: '淮南市' },
  { value: 'maanshan', label: '马鞍山市' },
  { value: 'huaibei', label: '淮北市' },
  { value: 'tongling', label: '铜陵市' },
  { value: 'anqing', label: '安庆市' },
  { value: 'huangshan', label: '黄山市' },
  { value: 'chuzhou', label: '滁州市' },
  { value: 'fuyang', label: '阜阳市' },
  { value: 'suzhou', label: '宿州市' },
  { value: 'liuan', label: '六安市' },
  { value: 'haozhou', label: '亳州市' },
  { value: 'chizhou', label: '池州市' },
  { value: 'xuancheng', label: '宣城市' }
]

// 归属BU（省公司/市公司共用同一份行业清单）
const buOptions = [
  '党政', '融合执法', '金融', '农商', '工业能源', '互联网', '交通', '教育', '医卫'
]

// 模拟客户库
const customerList = [
  { id: 'c1', name: '合肥市第一人民医院', contact: '张主任', phone: '13800138001' },
  { id: 'c2', name: '芜湖市政务服务中心', contact: '李处长', phone: '13800138002' },
  { id: 'c3', name: '蚌埠市教育局', contact: '王科长', phone: '13800138003' },
  { id: 'c4', name: '安徽医科大学附属医院', contact: '陈主任', phone: '13800138004' },
  { id: 'c5', name: '合肥市轨道交通集团', contact: '赵总', phone: '13800138005' }
]

// 审核人员
const handlerList = [
  { id: 'h1', name: '张主管' },
  { id: 'h2', name: '李经理' },
  { id: 'h3', name: '王总监' },
  { id: 'h4', name: '赵副总' },
  { id: 'h5', name: '陈主任' }
]

// 数字转中文大写 - 输入单位为"元"，返回含标记的数组，渲染时根据标记对"万"/"亿"加红加粗
function numberToChinese(num: number): { text: string; segments: { text: string; highlight: boolean }[] } {
  if (!num || isNaN(num) || num <= 0) return { text: '', segments: [] }
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const smallUnits = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿', '兆']

  // 处理小数部分（角分），保留两位小数
  const fixed = Math.round(num * 100) / 100
  const integerPart = Math.floor(fixed)
  const decimalPart = Math.round((fixed - integerPart) * 100)

  if (integerPart === 0 && decimalPart === 0) {
    return { text: '零元整', segments: [{ text: '零元整', highlight: false }] }
  }

  // 4 位段内转换（从高位到低位）
  const convertSection = (sec: string): string => {
    let r = ''
    let lastZero = false
    for (let i = 0; i < sec.length; i++) {
      const d = parseInt(sec[i])
      const u = smallUnits[sec.length - 1 - i]
      if (d === 0) {
        lastZero = true
      } else {
        if (lastZero && r) r += '零'
        lastZero = false
        r += digits[d] + u
      }
    }
    return r
  }

  // 整数部分：按 4 位一段拆开，从高段到低段处理，每段后追加大单位
  let intText = ''
  if (integerPart > 0) {
    const numStr = integerPart.toString()
    const padded = numStr.padStart(Math.ceil(numStr.length / 4) * 4, '0')
    const sections: string[] = []
    for (let i = 0; i < padded.length; i += 4) {
      sections.push(padded.substring(i, i + 4))
    }
    for (let i = sections.length - 1; i >= 0; i--) {
      const secText = convertSection(sections[i])
      const bigUnit = bigUnits[i]
      if (secText) {
        if (intText) intText += '零'
        intText += secText + bigUnit
      }
    }
  }

  let result = intText ? intText + '元' : ''

  // 小数部分（角分）
  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10)
    const fen = decimalPart % 10
    if (jiao > 0) {
      result += digits[jiao] + '角'
      if (fen > 0) result += digits[fen] + '分'
      else result += '整'
    } else {
      result += '零' + digits[fen] + '分'
    }
  } else {
    result += '整'
  }

  // 将 result 拆分成片段，"万"和"亿"高亮
  const segments: { text: string; highlight: boolean }[] = []
  let buf = ''
  for (const ch of result) {
    if (ch === '万' || ch === '亿') {
      if (buf) {
        segments.push({ text: buf, highlight: false })
        buf = ''
      }
      segments.push({ text: ch, highlight: true })
    } else {
      buf += ch
    }
  }
  if (buf) segments.push({ text: buf, highlight: false })

  return { text: result, segments }
}

interface FormData {
  clueName: string
  customerName: string
  contact: string
  phone: string
  sharedClueType: '省级线索' | '市级线索'
  cities: string[]
  city: string
  provBu: string[]
  cityBu: string[]
  secrecyLevel: 'normal' | 'secret'
  budget: string
  isPlatform: 'yes' | 'no'
  description: string
  nextHandler: string
}

interface FileItem {
  id: string
  name: string
  size: number
}

const defaultForm: FormData = {
  clueName: '',
  customerName: '',
  contact: '',
  phone: '',
  sharedClueType: '省级线索',
  cities: [],
  city: '',
  provBu: [],
  cityBu: [],
  secrecyLevel: 'normal',
  budget: '',
  isPlatform: 'no',
  description: '',
  nextHandler: ''
}

export default function ClueInput() {
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCityModal, setShowCityModal] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [tempCities, setTempCities] = useState<string[]>([])
  const [showBuModal, setShowBuModal] = useState<null | 'prov' | 'city'>(null)
  const [buSearch, setBuSearch] = useState('')
  const [tempProvBu, setTempProvBu] = useState<string[]>([])
  const [tempCityBu, setTempCityBu] = useState<string[]>([])
  const [showHandlerModal, setShowHandlerModal] = useState(false)
  const [handlerSearch, setHandlerSearch] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 预算金额 input DOM 引用（非受控模式，避免边输边触发）
  const budgetInputRef = useRef<HTMLInputElement>(null)
  // 统一管理所有表单控件的 DOM 引用（非受控模式，按字段名索引）
  const formRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>({})
  const setFieldRef = (key: string) => (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
    formRefs.current[key] = el
  }
  // 同步单个表单控件的值到 form state（onBlur 时调用）
  const syncField = <K extends keyof FormData>(key: K) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      handleChange(key, e.target.value as FormData[K])
    }

  // 客户过滤
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customerList
    return customerList.filter(c => c.name.includes(customerSearch))
  }, [customerSearch])

  // 归属BU过滤
  const filteredBu = useMemo(() => {
    if (!buSearch.trim()) return buOptions
    return buOptions.filter(b => b.includes(buSearch))
  }, [buSearch])

  // 处理人过滤
  const filteredHandlers = useMemo(() => {
    if (!handlerSearch.trim()) return handlerList
    return handlerList.filter(h => h.name.includes(handlerSearch))
  }, [handlerSearch])

  // 中文大写金额（仅在 onBlur 时更新，避免输入时频繁重渲染导致失焦）
  const [chineseAmount, setChineseAmount] = useState<{ text: string; segments: { text: string; highlight: boolean }[] }>({ text: '', segments: [] })

  // 当 form.budget 被外部重置/恢复时，同步到 input DOM
  useEffect(() => {
    if (budgetInputRef.current && budgetInputRef.current.value !== (form.budget || '')) {
      budgetInputRef.current.value = form.budget || ''
    }
  }, [form.budget])

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => {
      // 切换共享线索类型时，重置地市/区县
      if (key === 'sharedClueType') {
        return { ...prev, sharedClueType: value as FormData['sharedClueType'], cities: [] as string[], city: '' }
      }
      return { ...prev, [key]: value }
    })
    if (errors[key as string]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const handleSelectCustomer = (customer: typeof customerList[0]) => {
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      clueName: prev.clueName || `${customer.name}线索`
    }))
    setShowCustomerModal(false)
    setCustomerSearch('')
  }

  const handleSelectProvBu = (vals: string[]) => {
    handleChange('provBu', vals)
    setShowBuModal(null)
    setBuSearch('')
  }

  const handleSelectCityBu = (vals: string[]) => {
    handleChange('cityBu', vals)
    setShowBuModal(null)
    setBuSearch('')
  }

  const handleSelectHandler = (name: string) => {
    handleChange('nextHandler', name)
    setShowHandlerModal(false)
    setHandlerSearch('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return
    const newFiles: FileItem[] = Array.from(list).map(f => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size
    }))
    setFiles(prev => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }

  const handleReset = () => {
    setForm(defaultForm)
    setErrors({})
    setFiles([])
  }

  const validatePhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone)

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!form.clueName.trim()) newErrors.clueName = '请输入线索名称'
    if (!form.customerName.trim()) newErrors.customerName = '请输入或选择客户'
    if (!form.contact.trim()) newErrors.contact = '请输入客户联系人'
    if (!form.phone.trim()) {
      newErrors.phone = '请输入客户联系电话'
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = '请输入正确的手机号格式'
    }
    // 校验地市/区县：根据共享线索类型决定哪个必填
    if (form.sharedClueType === '省级线索') {
      if (form.cities.length === 0) newErrors.cities = '请至少选择一个归属地市'
    }
    if (form.sharedClueType === '市级线索') {
      if (!form.city) newErrors.city = '请选择归属地市'
    }
    if (form.provBu.length === 0) newErrors.provBu = '请至少选择一个省公司BU'
    if (form.cityBu.length === 0) newErrors.cityBu = '请至少选择一个市公司BU'
    if (!form.budget.trim()) newErrors.budget = '请输入预算金额'
    if (!form.description.trim()) newErrors.description = '请输入线索描述'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    alert('提交成功！')
    console.log('表单数据:', form)
  }

  // 区块标题组件
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3 mt-1 first:mt-0">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
    </div>
  )

  // 字段行（label 与输入框同行）
  const FieldRow = ({
    label,
    required,
    error,
    colSpan,
    children
  }: {
    label: string
    required?: boolean
    error?: string
    colSpan?: 1 | 2
    children: React.ReactNode
  }) => (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-center gap-3 min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className="flex-1 min-w-0">
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* ========== 客户信息 ========== */}
          <SectionTitle>客户信息</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {/* 客户名称（占两列） */}
            <FieldRow label="客户名称" required colSpan={2} error={errors.customerName}>
              <div className="flex items-stretch gap-2">
                <input
                  ref={setFieldRef('customerName')}
                  type="text"
                  defaultValue={form.customerName}
                  onBlur={syncField('customerName')}
                  placeholder="请输入或选择已有客户"
                  className={clsx(
                    'flex-1 min-w-0 px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="shrink-0 px-3 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  title="从已有客户库中选择"
                >
                  <Search className="w-4 h-4" />
                  选择已有客户
                </button>
              </div>
            </FieldRow>

            <FieldRow label="客户联系人" required error={errors.contact}>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="请输入客户联系人"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>

            <FieldRow label="客户联系电话" required error={errors.phone}>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => {
                  if (form.phone && !validatePhone(form.phone)) {
                    setErrors(prev => ({ ...prev, phone: '请输入正确的手机号格式' }))
                  }
                }}
                placeholder="请输入客户联系电话"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>
          </div>

          {/* ========== 线索信息 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle>线索信息</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {/* 线索名称（占两列） */}
              <FieldRow label="线索名称" required colSpan={2} error={errors.clueName}>
                <input
                  type="text"
                  value={form.clueName}
                  onChange={(e) => handleChange('clueName', e.target.value)}
                  placeholder="请输入线索名称"
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    errors.clueName ? 'border-red-500' : 'border-gray-300'
                  )}
                />
              </FieldRow>

              {/* 共享线索类型（横铺单选，默认选中第一个） */}
              {/* 共享线索类型（横铺单选，默认选中第一个，占一列） */}
              <FieldRow label="共享线索类型" required>
                <div className="flex items-center gap-6 whitespace-nowrap">
                  {(['省级线索', '市级线索'] as const).map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="sharedClueType"
                        value={t}
                        checked={form.sharedClueType === t}
                        onChange={() => handleChange('sharedClueType', t)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>

              {/* 归属地市（与共享线索类型同行，省级线索 时显示） */}
              {form.sharedClueType === '省级线索' && (
                <FieldRow label="归属地市" required error={errors.cities}>
                  <div>
                    <div
                      className={clsx(
                        'min-h-[36px] w-full pl-2 pr-2 py-1.5 text-sm border rounded-md focus-within:border-blue-500 flex flex-wrap items-center gap-1.5',
                        errors.cities ? 'border-red-500' : 'border-gray-300'
                      )}
                    >
                      {form.cities.map(cv => {
                        const c = cities.find(item => item.value === cv)
                        return (
                          <span
                            key={cv}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                          >
                            {c?.label || cv}
                            <button
                              type="button"
                              onClick={() => handleChange('cities', form.cities.filter(v => v !== cv))}
                              className="hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setTempCities([...form.cities])
                          setShowCityModal(true)
                          setCitySearch('')
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs border border-dashed border-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                        选择地市
                      </button>
                    </div>
                  </div>
                </FieldRow>
              )}

              {/* 归属地市（与共享线索类型同行，市级线索 时显示 - 单选） */}
              {form.sharedClueType === '市级线索' && (
                <FieldRow label="归属地市" required error={errors.city}>
                  <select
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    )}
                  >
                    <option value="">请选择</option>
                    {cities.filter(c => c.value !== '' && c.value !== 'province').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </FieldRow>
              )}

              {/* 省公司BU（多选，必填） */}
              <FieldRow label="省公司BU" required error={errors.provBu}>
                <div
                  className={clsx(
                    'min-h-[36px] w-full pl-2 pr-2 py-1.5 text-sm border rounded-md focus-within:border-blue-500 flex flex-wrap items-center gap-1.5',
                    errors.provBu ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  {form.provBu.map(bv => (
                    <span
                      key={bv}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                    >
                      {bv}
                      <button
                        type="button"
                        onClick={() => handleChange('provBu', form.provBu.filter(v => v !== bv))}
                        className="hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTempProvBu([...form.provBu])
                      setShowBuModal('prov')
                      setBuSearch('')
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs border border-dashed border-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                    选择
                  </button>
                </div>
              </FieldRow>

              {/* 市公司BU（多选，必填） */}
              <FieldRow label="市公司BU" required error={errors.cityBu}>
                <div
                  className={clsx(
                    'min-h-[36px] w-full pl-2 pr-2 py-1.5 text-sm border rounded-md focus-within:border-blue-500 flex flex-wrap items-center gap-1.5',
                    errors.cityBu ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  {form.cityBu.map(bv => (
                    <span
                      key={bv}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                    >
                      {bv}
                      <button
                        type="button"
                        onClick={() => handleChange('cityBu', form.cityBu.filter(v => v !== bv))}
                        className="hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTempCityBu([...form.cityBu])
                      setShowBuModal('city')
                      setBuSearch('')
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs border border-dashed border-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                    选择
                  </button>
                </div>
              </FieldRow>

              {/* 预算金额（占一列，必填） */}
              <FieldRow label="预算金额" required error={errors.budget}>
                <div className="relative">
                  <input
                    ref={budgetInputRef}
                    type="text"
                    inputMode="decimal"
                    defaultValue={form.budget || ''}
                    // 不绑 value 和 onChange（采用非受控模式，避免边输边触发）
                    onBlur={(e) => {
                      const rawValue = e.target.value
                      const formatted = formatToTwoDecimals(rawValue)
                      if (formatted !== rawValue && budgetInputRef.current) {
                        budgetInputRef.current.value = formatted
                      }
                      if (formatted !== form.budget) {
                        handleChange('budget', formatted)
                      }
                      // 离开控件时触发大写金额展示（输入金额万元 × 10000 = 实际金额元）
                      const num = parseFloat(formatted)
                      if (!isNaN(num) && num > 0) {
                        setChineseAmount(numberToChinese(num * 10000))
                      } else {
                        setChineseAmount({ text: '', segments: [] })
                      }
                    }}
                    placeholder="请输入大于0的数字，保留两位小数"
                    className="w-full pl-3 pr-14 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">万元</span>
                </div>
                {chineseAmount.text && (
                  <p className="text-sm text-[#1677FF] mt-1 font-medium">
                    {chineseAmount.segments.map((s, i) => (
                      <span key={i} className={s.highlight ? 'text-red-600 font-bold' : ''}>
                        {s.text}
                      </span>
                    ))}
                  </p>
                )}
              </FieldRow>

              {/* 保密级别 */}
              <FieldRow label="保密级别" required>
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="secrecyLevel"
                      value="normal"
                      checked={form.secrecyLevel === 'normal'}
                      onChange={() => handleChange('secrecyLevel', 'normal')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">普通</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="secrecyLevel"
                      value="secret"
                      checked={form.secrecyLevel === 'secret'}
                      onChange={() => handleChange('secrecyLevel', 'secret')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">保密</span>
                  </label>
                </div>
              </FieldRow>

              {/* 是否平台卡位类 */}
              <FieldRow label="是否平台卡位类">
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isPlatform"
                      value="yes"
                      checked={form.isPlatform === 'yes'}
                      onChange={() => handleChange('isPlatform', 'yes')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">是</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isPlatform"
                      value="no"
                      checked={form.isPlatform === 'no'}
                      onChange={() => handleChange('isPlatform', 'no')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">否</span>
                  </label>
                </div>
              </FieldRow>

              {/* 线索描述（通栏） */}
              <FieldRow label="线索描述" required colSpan={2} error={errors.description}>
                <textarea
                  ref={setFieldRef('description')}
                  defaultValue={form.description}
                  onBlur={syncField('description')}
                  placeholder="请输入线索描述"
                  rows={3}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 resize-none',
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  )}
                />
              </FieldRow>

              {/* 线索附件（通栏） */}
              <FieldRow label="线索附件" colSpan={2}>
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-md py-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1.5" />
                    <p className="text-sm text-gray-600">点击上传附件</p>
                    <p className="text-xs text-gray-400 mt-0.5">支持多文件，单个文件不超过 20MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {files.map(f => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{f.name}</span>
                            <span className="text-xs text-gray-400 shrink-0">({formatSize(f.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(f.id) }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded shrink-0"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FieldRow>
            </div>
          </div>

          {/* ========== 流程信息 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle>流程信息</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="下一步环节">
                <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  线索审核
                </div>
              </FieldRow>
              <FieldRow label="下一步处理人">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={form.nextHandler}
                    onClick={() => setShowHandlerModal(true)}
                    placeholder="请选择下一步处理人"
                    className="w-full pl-3 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHandlerModal(true)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择处理人"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </FieldRow>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              提交
            </button>
          </div>
        </div>
      </div>

      {/* 客户选择弹窗 */}
      {showCustomerModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowCustomerModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择客户</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="搜索客户名称"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到客户</div>
              ) : (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="text-sm font-medium text-gray-800">{customer.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {customer.contact} · {customer.phone}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 归属地市多选弹窗 */}
      {showCityModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowCityModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[460px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择归属地市（可多选）</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="搜索地市"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {cities.filter(c => !citySearch.trim() || c.label.includes(citySearch)).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到地市</div>
              ) : (
                cities
                  .filter(c => !citySearch.trim() || c.label.includes(citySearch))
                  .map(c => {
                    const selected = tempCities.includes(c.value)
                    return (
                      <div
                        key={c.value}
                        onClick={() => {
                          if (selected) {
                            setTempCities(tempCities.filter(v => v !== c.value))
                          } else {
                            setTempCities([...tempCities, c.value])
                          }
                        }}
                        className={clsx(
                          'px-5 py-2.5 cursor-pointer border-b border-gray-100 text-sm flex items-center gap-2 hover:bg-blue-50',
                          selected ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'
                        )}
                      >
                        <span className={clsx(
                          'w-4 h-4 border rounded flex items-center justify-center shrink-0',
                          selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                        )}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        {c.label}
                      </div>
                    )
                  })
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">已选 {tempCities.length} 项</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCityModal(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleChange('cities', [...tempCities])
                    setShowCityModal(false)
                    setCitySearch('')
                  }}
                  className="px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 归属BU弹窗（省公司/市公司共用，区分 showBuModal） */}
      {showBuModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowBuModal(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[420px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">
                {showBuModal === 'prov' ? '选择省公司BU' : '选择市公司BU'}（可多选）
              </h3>
              <button
                onClick={() => setShowBuModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={buSearch}
                onChange={(e) => setBuSearch(e.target.value)}
                placeholder="搜索BU"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredBu.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到BU</div>
              ) : (
                filteredBu.map(item => {
                  const currentList = showBuModal === 'prov' ? tempProvBu : tempCityBu
                  const selected = currentList.includes(item)
                  return (
                    <div
                      key={item}
                      onClick={() => {
                        if (showBuModal === 'prov') {
                          if (selected) {
                            setTempProvBu(tempProvBu.filter(v => v !== item))
                          } else {
                            setTempProvBu([...tempProvBu, item])
                          }
                        } else {
                          if (selected) {
                            setTempCityBu(tempCityBu.filter(v => v !== item))
                          } else {
                            setTempCityBu([...tempCityBu, item])
                          }
                        }
                      }}
                      className={clsx(
                        'px-5 py-2.5 cursor-pointer border-b border-gray-100 text-sm flex items-center gap-2 hover:bg-blue-50',
                        selected ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'
                      )}
                    >
                      <span className={clsx(
                        'w-4 h-4 border rounded flex items-center justify-center shrink-0',
                        selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                      )}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </span>
                      {item}
                    </div>
                  )
                })
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                已选 {showBuModal === 'prov' ? tempProvBu.length : tempCityBu.length} 项
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBuModal(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (showBuModal === 'prov') {
                      handleSelectProvBu([...tempProvBu])
                    } else {
                      handleSelectCityBu([...tempCityBu])
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 下一步处理人弹窗 */}
      {showHandlerModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowHandlerModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择下一步处理人</h3>
              <button
                onClick={() => setShowHandlerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={handlerSearch}
                onChange={(e) => setHandlerSearch(e.target.value)}
                placeholder="搜索处理人姓名"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredHandlers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到处理人</div>
              ) : (
                filteredHandlers.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHandler(item.name)}
                    className={clsx(
                      'px-5 py-3 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                      form.nextHandler === item.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    )}
                  >
                    {item.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
