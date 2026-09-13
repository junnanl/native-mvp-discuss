import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 清洗数字输入：只允许数字和一个小数点
 * - 去除所有非数字和小数点的字符
 * - 限制只能有一个小数点
 * - 如果首字符是小数点，自动补 0
 */
export function sanitizeAmountInput(value: string): string {
  if (!value) return ''
  // 去除非法字符
  let cleaned = value.replace(/[^\d.]/g, '')
  // 只保留第一个小数点
  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
  }
  // 首字符不能是 .
  if (cleaned.startsWith('.')) cleaned = '0' + cleaned
  return cleaned
}

/**
 * 将数字格式化为保留两位小数的字符串
 * - 空值返回空字符串
 * - 解析为数字后格式化为 2 位小数
 */
export function formatToTwoDecimals(value: string): string {
  if (!value) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num.toFixed(2)
}

/**
 * 计算不含税金额
 * 计算口径：不含税金额 = 含税金额 ÷ (1 + 税率)
 * @param amount 含税金额（可能包含千分位逗号）
 * @param taxRate 税率（可能包含百分号，如 "6%" 或 "13%"）
 * @returns 不含税金额字符串，保留两位小数
 */
export function calculateExcludingTax(amount: string, taxRate: string): string {
  const amountNum = parseFloat((amount || '0').replace(/,/g, '')) || 0
  const rateStr = (taxRate || '0%').replace(/%/g, '')
  const rateNum = parseFloat(rateStr) / 100 || 0
  const excludingTax = amountNum / (1 + rateNum)
  return excludingTax.toFixed(2)
}
