import { type Context, useContext } from 'react'

import { type Observable } from 'rxjs'
import { type StoreApi } from 'zustand'

import { useStoreSubscription } from './useStoreSubscription'

export const useContextStoreSubscription = <T>(context: Context<StoreApi<T>>, $observable: Observable<T>) => {
  useStoreSubscription(useContext(context), $observable)
}
