import {BookOpen, Brain, Eye, FilePenLine, FileSearch, Search, Send, Terminal, Wrench} from 'lucide-react';

const icons = {BookOpen, Brain, Eye, FilePenLine, FileSearch, Search, Send, Terminal, Wrench};

export function ToolIcon({name, size = 14}: {name: string; size?: number}) {
  const Icon = icons[name as keyof typeof icons] ?? Wrench;
  return <Icon size={size} />;
}
