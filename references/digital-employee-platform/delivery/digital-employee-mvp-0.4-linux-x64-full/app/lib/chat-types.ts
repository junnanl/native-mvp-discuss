export type RunStatus =
  | 'reviewing'
  | 'awaiting_confirmation'
  | 'blocked'
  | 'connecting'
  | 'running'
  | 'reconnecting'
  | 'cancel_requested'
  | 'cancelled'
  | 'completed'
  | 'failed';

export type SubagentStep = {
  id: string;
  tool: string;
  phase: string;
  status?: string;
  arguments?: unknown;
  error?: string;
  executionTime?: number;
};

export type ToolTrace = {
  id: string;
  name: string;
  status: 'running' | 'success' | 'error';
  arguments: string;
  progress: string;
  result: string;
  display?: string;
  executionTime?: number;
  permissionDenied?: boolean;
  permissionMode?: string;
  substeps: SubagentStep[];
};

export type Classification = 'public' | 'controlled' | 'internal';

export type InputAttachment = {
  file_path: string;
  file_name: string;
  file_type: string;
  classification: Classification;
  preview_url?: string;
};

export type OutputAttachment = {
  id: string;
  kind: 'image' | 'video' | 'audio' | 'file' | 'artifact';
  name: string;
  url: string;
  previewUrl?: string;
  size?: number;
  classification: Classification | 'pending';
};

export type ReviewResult = {
  decision: 'allow' | 'deny' | 'confirm';
  riskLevel: 'low' | 'medium' | 'high';
  categories: string[];
  summary: string;
  source?: 'employee' | 'fallback';
  trace?: {requestId: string; durationMs: number; phases: string[]; tools: string[]};
};

export type ChatTurn = {
  id: string;
  requestId?: string;
  user: string;
  assistant: string;
  reasoning: string;
  phases: string[];
  tools: ToolTrace[];
  inputAttachments: InputAttachment[];
  attachments: OutputAttachment[];
  unknownEvents: Array<Record<string, unknown>>;
  status: RunStatus;
  error?: string;
  review?: ReviewResult;
};

export type AguiEvent = {
  type: string;
  providerSeq?: number;
  name?: string;
  value?: Record<string, unknown>;
  rawEvent?: Record<string, unknown>;
  event?: Record<string, unknown>;
  source?: string;
  delta?: string;
  message?: string;
  toolCallId?: string;
  toolCallName?: string;
  content?: string;
  status?: string;
  executionTime?: number;
  display?: string;
  permissionDenied?: boolean;
  permissionMode?: string;
  result?: {cancelled?: boolean};
};
