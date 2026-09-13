export type ToolDisplay = {label: string; icon: string};

const displays: Record<string, ToolDisplay> = {
  read: {label: '读取资料', icon: 'FileSearch'},
  read_file: {label: '读取资料', icon: 'FileSearch'},
  write: {label: '更新工作文件', icon: 'FilePenLine'},
  write_file: {label: '更新工作文件', icon: 'FilePenLine'},
  str_replace_editor: {label: '更新工作文件', icon: 'FilePenLine'},
  bash: {label: '执行自动化', icon: 'Terminal'},
  shell: {label: '执行自动化', icon: 'Terminal'},
  send: {label: '交付文件', icon: 'Send'},
  memory_search: {label: '检索工作记忆', icon: 'Brain'},
  memory_get: {label: '读取记忆内容', icon: 'BookOpen'},
  vision: {label: '视觉理解', icon: 'Eye'},
  web_search: {label: '检索公开信息', icon: 'Search'},
};

export function toolDisplay(rawName: string): ToolDisplay {
  const normalized = rawName.trim().toLowerCase().replaceAll('-', '_');
  return displays[normalized] ?? {label: '执行工具', icon: 'Wrench'};
}
