interface NumberInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  decimals?: number
  disabled?: boolean
}

export default function NumberInput({
  value,
  onChange,
  placeholder,
  decimals = 2,
  disabled = false
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const v = e.target.value
    const regex = decimals > 0
      ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`)
      : /^\d*$/
    if (regex.test(v) || v === '') {
      onChange(v)
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={
        'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 ' +
        (disabled
          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-300 bg-white')
      }
    />
  )
}
