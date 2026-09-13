interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}

export default function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
