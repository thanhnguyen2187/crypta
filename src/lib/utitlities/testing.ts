import { http, HttpResponse, passthrough } from 'msw'
import path from 'path'
import fs from 'fs'
import type { Snippet } from '$lib/utitlities/persistence'

export const WASqliteWASMBaseURL = 'http://mock.local'
export function createWASqliteMockWASMHandler(baseUrl: string = WASqliteWASMBaseURL) {
  return [
    http.get(`${baseUrl}/wa-sqlite-async.wasm`, () => {
      const filePath = path.resolve(process.cwd(), 'static/wa-sqlite-async.wasm')
      const buffer = fs.readFileSync(filePath)
      return HttpResponse.arrayBuffer(buffer, {
        headers: {
          'Content-Type': 'application/wasm',
        }
      })
    }),
    http.get(`${baseUrl}/wa-sqlite.wasm`, () => {
      const filePath = path.resolve(process.cwd(), 'static/wa-sqlite.wasm')
      const buffer = fs.readFileSync(filePath)
      return HttpResponse.arrayBuffer(buffer, {
        headers: {
          'Content-Type': 'application/wasm',
        }
      })
    }),
  ]
}

export function createRemoteServerURLHandler() {
  return [
    http.all(`http://127.0.0.1:12321/*`, () => {
      return passthrough()
    })
  ]
}

export function createDummySnippet(id: string, createdAt: number, updatedAt: number): Snippet {
  return {
    id,
    name: 'dummy name',
    language: 'dummy language',
    text: 'dummy text',
    tags: [],
    encrypted: false,
    position: 1,
    createdAt,
    updatedAt,
  }
}