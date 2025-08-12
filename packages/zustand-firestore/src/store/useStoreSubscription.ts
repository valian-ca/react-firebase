import { useEffect } from 'react'

import { useSubscription } from 'observable-hooks'
import { type Observable } from 'rxjs'
import { type StoreApi } from 'zustand'

export const useStoreSubscription = <T>(store: StoreApi<T>, $observable: Observable<T>) => {
  useEffect(
    () => () => {
      // reset the store on unmount
      store.setState(store.getInitialState())
    },
    [store],
  )
  useSubscription($observable, (result) => {
    store.setState(result)
  })
}
