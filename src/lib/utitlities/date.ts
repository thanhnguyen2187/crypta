export function format(d: Date): string {
  // return d.toISOString().replace('Z', ' ').replace('T', ' ')
  return d.toLocaleString()
}
