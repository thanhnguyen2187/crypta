export type Params = {[key: string]: any}

export type Transaction = {
  noFail?: boolean
} & (
  {
    query: string
  } |
  {
    statement: string
  }
) & (
  {
    values?: Params | string[]
  } |
  {
    valuesBatch?: Params[]
  }
)

export type Request = {
  credentials?: {
    user: string
    password: string
  }
  transaction: []
}

export type ResultTrue = {
  success: true,
} & (
  {
    resultSet: any[]
  } |
  {
    rowsUpdated: number
  } |
  {
    rowsUpdatedBatch: number[]
  }
)

export type ResultFalse = {
  success: false
  error: string
}

export type Result = ResultTrue | ResultFalse

export type Response = {
  results: Result[]
}

export type SqlitergExecutor = {
  execute(queryOrStatement: string, params: Params): Promise<Response>
}
