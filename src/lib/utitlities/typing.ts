export type ValueType<T> =
  T extends Promise<infer U>
    ? U
    : T

export type Flatten<Type> =
  Type extends Array<infer Item>
    ? Item
    : Type

