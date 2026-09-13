import type { ViewData } from '../types'

type Props = Extract<ViewData, { component: 'text' }>

/** 叙述类产物。第一版只做最朴素的段落与标题，不引 markdown 依赖。 */
export default function TextBlock({ markdown }: Props) {
  return (
    <div className="space-y-2 text-sm leading-6 text-gray-700">
      {markdown.split('\n').filter(line => line.trim()).map((line, index) =>
        line.startsWith('#') ? (
          <h4 key={index} className="text-sm font-semibold text-gray-800 pt-1">{line.replace(/^#+\s*/, '')}</h4>
        ) : (
          <p key={index}>{line}</p>
        ),
      )}
    </div>
  )
}
