type Snippet = {
  id: string
  name: string
  language: string
  text: string
  encrypted: boolean
}

/* Utility wrapper around OPFS to read a file to string.
 *
 * @param path a string that is similar to a unique key to the file; uses
 * forward slash (`/`) to separate between folder(s) and file name; trailing
 * slashes are not permitted.
 * @example
 * // valid
 * readFile('a.json')
 * readFile('b/a.txt')
 * // error
 * readFile('/c/b/a.json')
 * readFile('c/b/a.json/')
 * */
export function readFile(path: string): string {
  return ''
}

/* Get files in a certain folder. Create the folder if not existed.
 * */
export function queryFiles(path: string): string[] {
  return []
}

export function queryFolders(path: string): void {}

export async function readSnippets(folderName: string = 'default'): Promise<Snippet[]> {
  const opfsRoot = await navigator.storage.getDirectory()
  const folder = await opfsRoot.getDirectoryHandle(folderName, {create: true})
}

export function readSnippet(folder: string, id: string) {}

export function writeSnippet(folder: string, id: string) {}

/* Snippet to Card and vice versa
 *
 *
 *
 * */