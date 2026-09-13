import * as React from 'react';
import {cn} from '@/lib/utils';

export function Input({className, type, ...props}: React.ComponentProps<'input'>) {
  return <input type={type} className={cn('h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', className)} {...props} />;
}
