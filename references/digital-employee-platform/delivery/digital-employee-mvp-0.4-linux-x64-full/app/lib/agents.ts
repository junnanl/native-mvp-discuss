export type EmployeeStatus = 'enabled' | 'disabled';
export type CapabilityKind = 'tool' | 'skill' | 'knowledge';

export type EmployeeCapability = {
  id: string;
  name: string;
  kind: CapabilityKind;
  icon: string;
};

export type Employee = {
  id: string;
  title: string;
  category: string;
  avatar: string;
  accent: string;
  accentSoft: string;
  status: EmployeeStatus;
  description: string;
  tags: string[];
  maturity: string;
  version: string;
  capabilities: EmployeeCapability[];
  quickQuestions: string[];
  systemPrompt: string;
  sortOrder: number;
  harnessUrl?: string;
  harnessPassword?: string;
};
