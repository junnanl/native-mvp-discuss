import {promises as fs} from 'node:fs';
import path from 'node:path';
import {z} from 'zod';
import type {Employee} from './agents';

const employeeSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/),
  title: z.string().trim().min(1).max(60),
  category: z.string().trim().min(1).max(40),
  avatar: z.string().trim().min(1).max(240),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentSoft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  status: z.enum(['enabled', 'disabled']),
  description: z.string().trim().min(1).max(300),
  tags: z.array(z.string().trim().min(1).max(24)).max(12),
  maturity: z.string().trim().min(1).max(24),
  version: z.string().trim().regex(/^V\d+(?:\.\d+){1,2}$/i, '版本号格式应为 V1.0 或 V1.0.0'),
  capabilities: z.array(z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/),
    name: z.string().trim().min(1).max(40),
    kind: z.enum(['tool', 'skill', 'knowledge']),
    icon: z.string().trim().min(1).max(40),
  })).max(16),
  quickQuestions: z.array(z.string().trim().min(1).max(240)).max(8),
  systemPrompt: z.string().trim().min(1).max(12000),
  sortOrder: z.number().int().min(0).max(9999),
  harnessUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  harnessPassword: z.string().max(240).optional(),
});

export const employeesSchema = z.array(employeeSchema).min(1).max(40).superRefine((employees, context) => {
  const ids = new Set<string>();
  employees.forEach((employee, index) => {
    if (ids.has(employee.id)) context.addIssue({code: 'custom', path: [index, 'id'], message: '员工 ID 不能重复'});
    ids.add(employee.id);
  });
});

const dataPath = path.join(process.cwd(), 'data', 'employees.json');

export async function readEmployees(): Promise<Employee[]> {
  const contents = await fs.readFile(dataPath, 'utf8');
  return employeesSchema.parse(JSON.parse(contents)).sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getEmployee(id: string) {
  return (await readEmployees()).find((employee) => employee.id === id);
}

export async function writeEmployees(value: unknown) {
  const employees = employeesSchema.parse(value).sort((left, right) => left.sortOrder - right.sortOrder);
  const temporaryPath = `${dataPath}.${process.pid}.tmp`;
  await fs.mkdir(path.dirname(dataPath), {recursive: true});
  await fs.writeFile(temporaryPath, `${JSON.stringify(employees, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, dataPath);
  return employees;
}
