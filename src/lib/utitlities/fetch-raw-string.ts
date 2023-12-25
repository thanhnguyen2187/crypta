export async function fetchRawString(url: string) {
  const response = await fetch(url)
  return await response.text()
}
