import {LoaderCircle} from 'lucide-react';
import {cn} from '@/lib/utils';

export function StatusSpinner({size = 16, className}: {size?: number; className?: string}) {
  return <LoaderCircle aria-hidden="true" className={cn('status-spinner shrink-0', className)} size={size} />;
}
