interface FormRowProps {
  label: string
  children: React.ReactNode
  required?: boolean
  span?: number
}

export default function FormRow({
  label,
  children,
  required,
  span = 1
}: FormRowProps) {
  return (
    <div
      className="flex flex-col gap-1.5 min-w-0"
      style={span === 2 ? { gridColumn: 'span 2' } : undefined}
    >
      <label className="text-xs text-gray-600 shrink-0">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
