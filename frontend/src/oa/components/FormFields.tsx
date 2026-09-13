import type { Field } from '../types'

type Props = {
  fields: Field[]
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
  disabled?: boolean
}

const INPUT = 'w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 ' +
  'focus:border-[#1677FF] focus:outline-none focus:ring-1 focus:ring-[#1677FF]/30 disabled:bg-gray-50'

/**
 * 按 form_def.fields 渲染。
 *
 * 这里不认识任何具体字段名——认识了就等于把表单定义搬回代码里。加一个字段只该
 * 改数据库，页面自己会多一个对应类型的控件。
 */
export default function FormFields({ fields, values, onChange, disabled }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(field => (
        <label
          key={field.key}
          className={field.type === 'textarea' ? 'sm:col-span-2 block' : 'block'}
        >
          <span className="block text-xs text-gray-500 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>

          {field.type === 'select' ? (
            <select
              className={INPUT}
              disabled={disabled}
              value={String(values[field.key] ?? '')}
              onChange={event => set(field.key, event.target.value)}
            >
              <option value="">请选择</option>
              {(field.options ?? []).map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              className={`${INPUT} min-h-[76px]`}
              disabled={disabled}
              value={String(values[field.key] ?? '')}
              onChange={event => set(field.key, event.target.value)}
            />
          ) : (
            <input
              className={INPUT}
              disabled={disabled}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={String(values[field.key] ?? '')}
              onChange={event => set(field.key, event.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  )
}
