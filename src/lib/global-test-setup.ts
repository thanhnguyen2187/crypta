import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
// import fs from 'node:fs'
import * as fs from 'fs'
// import path from 'node:path'
import * as path from 'path'

export const restHandlers = [
  http.get('./wa-sqlite-async.wasm', () => {
    const filePath = path.resolve(process.cwd(), 'static/wa-sqlite-async.wasm')
    const buffer = fs.readFileSync(filePath)
    return HttpResponse.arrayBuffer(buffer, {
      headers: {
        'Content-Type': 'application/wasm',
      }
    })
    // return HttpResponse.text('test')
    // return HttpResponse.text(WASqliteAsyncWASM)
  }),
  http.get('http://mock.local/wa-sqlite-async.wasm', () => {
    const filePath = path.resolve(process.cwd(), 'static/wa-sqlite-async.wasm')
    const buffer = fs.readFileSync(filePath)
    return HttpResponse.arrayBuffer(buffer, {
      headers: {
        'Content-Type': 'application/wasm',
      }
    })
    // return HttpResponse.text('test')
    // return HttpResponse.text(WASqliteAsyncWASM)
  }),
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
