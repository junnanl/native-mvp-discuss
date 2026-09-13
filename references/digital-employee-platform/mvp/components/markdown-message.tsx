import type {Components} from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {cn} from '@/lib/utils';

const safeProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function safeUrlTransform(url: string) {
  const value = url.trim();
  if (!value) return '';

  try {
    const parsed = new URL(value, 'https://agent-task.local');
    return safeProtocols.has(parsed.protocol.toLowerCase()) ? value : '';
  } catch {
    return '';
  }
}

const components: Components = {
  h1: ({className, ...props}) => <h1 className={cn('mb-3 mt-6 font-serif text-2xl font-semibold first:mt-0', className)} {...props} />,
  h2: ({className, ...props}) => <h2 className={cn('mb-2 mt-5 font-serif text-xl font-semibold first:mt-0', className)} {...props} />,
  h3: ({className, ...props}) => <h3 className={cn('mb-2 mt-4 text-base font-semibold first:mt-0', className)} {...props} />,
  p: ({className, ...props}) => <p className={cn('my-2 leading-7 first:mt-0 last:mb-0', className)} {...props} />,
  ul: ({className, ...props}) => <ul className={cn('my-3 list-disc space-y-1 pl-6', className)} {...props} />,
  ol: ({className, ...props}) => <ol className={cn('my-3 list-decimal space-y-1 pl-6', className)} {...props} />,
  li: ({className, ...props}) => <li className={cn('pl-1 leading-7', className)} {...props} />,
  input: ({className, ...props}) => <input className={cn('mr-2 align-middle accent-slate-700', className)} {...props} />,
  blockquote: ({className, ...props}) => <blockquote className={cn('my-4 border-l-2 border-blue-500 pl-4 text-muted-foreground', className)} {...props} />,
  a: ({className, ...props}) => <a className={cn('font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900', className)} target="_blank" rel="noreferrer" {...props} />,
  code: ({className, ...props}) => <code className={cn('rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800', className)} {...props} />,
  pre: ({className, ...props}) => <pre className={cn('my-4 max-h-[420px] overflow-auto rounded-md border bg-slate-950 p-4 text-[12px] leading-6 text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit', className)} {...props} />,
  table: ({className, ...props}) => <div className="my-4 overflow-x-auto"><table className={cn('w-full border-collapse text-left text-sm', className)} {...props} /></div>,
  th: ({className, ...props}) => <th className={cn('border bg-muted px-3 py-2 font-semibold', className)} {...props} />,
  td: ({className, ...props}) => <td className={cn('border px-3 py-2 align-top', className)} {...props} />,
  del: ({className, ...props}) => <del className={cn('text-muted-foreground line-through', className)} {...props} />,
  hr: ({className, ...props}) => <hr className={cn('my-6 border-border', className)} {...props} />,
};

export function MarkdownMessage({children, className}: {children: string; className?: string}) {
  return (
    <div className={cn('min-w-0 break-words text-sm text-foreground', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
        urlTransform={safeUrlTransform}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
