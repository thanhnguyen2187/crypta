/* Take an item at one index and put it in another index.
 *
 * @param index1 the "moving" item's index
 * @param index2 the "pivot" item's index
 * @example
 * inject(['a', 'b', 'c', 'd', 'e'], 1, 3)
 * // first, we move `b` out of the place
 * // ['a', 'c', 'd', 'e']
 * // then we insert `b` to the place after `d`
 * // ['a', 'c', 'd', 'b', 'e']
 * */
export function inject<T>(items: T[], index1: number, index2: number): T[] {
  if (index1 == index2) {
    return items
  }

  items = items.slice()
  const item = items.splice(index1, 1)[0]
  items = insert(items, index2, item)
  return items
}

export function replace<T>(items: T[], index: number, item: T): T[] {
  return [
    ...items.slice(0, index),
    item,
    ...items.slice(index + 1),
  ]
}

export function remove<T>(items: T[], index: number): T[] {
  return [
    ...items.slice(0, index),
    ...items.slice(index + 1),
  ]
}

export function insert<T>(items: T[], index: number, item: T): T[] {
  return [
    ...items.slice(0, index),
    item,
    ...items.slice(index),
  ]
}

export function append<T>(items: T[], item: T): T[] {
  return [
    ...items,
    item,
  ]
}

