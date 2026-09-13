'use client';

import {AlertCircle} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {Employee} from '../lib/agents';
import {EmployeePlaza} from './employee-plaza';
import {EmployeeWorkbench} from './employee-workbench';
import {StatusSpinner} from './ui/status-spinner';

export function MvpShell() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dispatchQuestions, setDispatchQuestions] = useState<string[]>([]);
  const [initialDraft, setInitialDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/api/employees', {cache: 'no-store'})
      .then(async (response) => {
        const payload = await response.json() as {employees?: Employee[]; dispatchQuestions?: string[]; error?: string};
        if (!response.ok || !payload.employees) throw new Error(payload.error ?? '员工配置读取失败');
        setEmployees(payload.employees);
        setDispatchQuestions(payload.dispatchQuestions ?? []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : '员工配置读取失败'));
  }, []);

  if (error) return <main className="grid min-h-screen place-items-center p-6"><div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle size={18} />{error}</div></main>;
  if (!employees.length) return <main className="grid min-h-screen place-items-center"><div className="flex items-center gap-2 text-sm text-muted-foreground"><StatusSpinner size={18} />正在读取员工配置</div></main>;

  return employee
    ? <EmployeeWorkbench employee={employee} initialDraft={initialDraft} onBack={() => {setEmployee(null); setInitialDraft('');}} />
    : <EmployeePlaza employees={employees} dispatchQuestions={dispatchQuestions} onSelect={(selected, draft) => {setEmployee(selected); setInitialDraft(draft ?? '');}} />;
}
