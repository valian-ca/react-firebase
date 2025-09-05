import { type Unsubscribable } from 'rxjs'

export const queriesSubscriptions = new Map<string, Unsubscribable>()
