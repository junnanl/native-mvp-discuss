export function calculateTotal<T>(list: T[], field: keyof T): number {
  return list.reduce((acc, curr) => {
    const value = curr[field]
    if (typeof value === 'string') {
      const n = parseFloat(value.replace(/,/g, ''))
      return acc + (isNaN(n) ? 0 : n)
    }
    if (typeof value === 'number') {
      return acc + value
    }
    return acc
  }, 0)
}
