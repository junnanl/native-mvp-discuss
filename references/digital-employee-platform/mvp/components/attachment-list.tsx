'use client';

import {Download, ExternalLink, FileText, Volume2} from 'lucide-react';
import type {Classification, OutputAttachment} from '../lib/chat-types';
import {A2uiSurfaceView, artifactClassificationSurface} from './a2ui-surface';
import {Badge} from './ui/badge';

export function AttachmentList({items, onClassify}: {items: OutputAttachment[]; onClassify: (artifactId: string, classification: Classification) => void}) {
  if (!items.length) return null;
  return (
    <div className="mt-3 grid max-w-xl gap-2" aria-label="生成内容">
      {items.map((item) => {
        if (item.classification === 'pending') {
          return <A2uiSurfaceView key={item.id} surface={artifactClassificationSurface(item)} onAction={(name, context) => {
            const classification = context.classification;
            if (name === 'classify_artifact' && (classification === 'public' || classification === 'controlled' || classification === 'internal')) onClassify(item.id, classification);
          }} />;
        }
        if (item.kind === 'image') {
          return <a className="grid gap-1.5 text-[10px] text-muted-foreground" href={item.url} target="_blank" rel="noreferrer" key={item.id}><img className="block max-h-[360px] max-w-full rounded-md border bg-card object-contain" src={item.url} alt={item.name} /><span className="flex items-center gap-2">{item.name}<ClassificationBadge value={item.classification} /></span></a>;
        }
        if (item.kind === 'video') {
          return <figure className="grid gap-1.5 text-[10px] text-muted-foreground" key={item.id}><video className="max-h-[360px] w-full rounded-md bg-slate-950" src={item.url} controls preload="metadata" /><figcaption className="flex items-center gap-2">{item.name}<ClassificationBadge value={item.classification} /></figcaption></figure>;
        }
        if (item.kind === 'audio') {
          return <div className="flex min-h-14 items-center gap-3 rounded-md border bg-card p-3" key={item.id}><Volume2 size={16} /><div className="grid min-w-0 flex-1 gap-1.5 text-[11px] text-muted-foreground"><span className="flex items-center gap-2">{item.name}<ClassificationBadge value={item.classification} /></span><audio className="h-7 w-full" src={item.url} controls preload="metadata" /></div></div>;
        }
        return (
          <div className="flex min-h-14 items-center gap-3 rounded-md border bg-card p-3" key={item.id}>
            <FileText className="shrink-0" size={18} /><div className="grid min-w-0 flex-1"><strong className="truncate text-xs">{item.name}</strong><span className="flex items-center gap-2 text-[10px] text-muted-foreground">{item.kind === 'artifact' ? '生成文件' : '附件'}{formatSize(item.size)}<ClassificationBadge value={item.classification} /></span></div>
            {item.previewUrl && <a className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" href={item.previewUrl} target="_blank" rel="noreferrer" title="预览"><ExternalLink size={16} /></a>}
            <a className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" href={item.url} download title="下载"><Download size={16} /></a>
          </div>
        );
      })}
    </div>
  );
}

function ClassificationBadge({value}: {value: Classification}) {
  return <Badge variant="outline" className="px-1.5 py-0 text-[9px]">{{public: '公开', controlled: '受控', internal: '内部'}[value]}</Badge>;
}

function formatSize(size?: number) {
  if (!size) return '';
  if (size < 1024) return ` · ${size} B`;
  if (size < 1024 * 1024) return ` · ${(size / 1024).toFixed(1)} KB`;
  return ` · ${(size / 1024 / 1024).toFixed(1)} MB`;
}
