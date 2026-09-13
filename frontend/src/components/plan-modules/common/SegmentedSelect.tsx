interface SegmentedSelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
}

export default function SegmentedSelect({
  value,
  onChange,
  options
}: SegmentedSelectProps) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white">
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(opt)}
          className={
            'px-5 py-2 text-sm transition-colors ' +
            (value === opt
              ? 'bg-[#1677FF] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50') +
            (idx > 0 ? ' border-l border-gray-300' : '')
          }
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
