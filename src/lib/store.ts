import { writable } from 'svelte/store'
import type { Card } from '$lib/card';

export const toasterText = writable<string | null>(null)
export const cards = writable<Card[]>([])
