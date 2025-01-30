import { useCallback, useReducer } from 'react'

import { type DocumentData, onSnapshot, type Query } from '@firebase/firestore'

import {
  CollectionReducerInitialState,
  type CollectionReducerState,
  collectionStateReducer,
} from './support/collectionStateReducer'
import { isFirestoreQueryEqual } from './support/isFirestoreQueryEqual'
import { useCustomCompareEffect } from './support/useCustomCompareEffect'

export interface UseCollectionOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  query: Query<AppModelType, DbModelType> | null
  onError?: (error: unknown) => void
}

export type UseCollectionResult<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> = CollectionReducerState<AppModelType, DbModelType>

export const useCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>({
  query,
  onError,
}: UseCollectionOptions<AppModelType, DbModelType>): UseCollectionResult<AppModelType, DbModelType> => {
  const [state, dispatch] = useReducer(
    collectionStateReducer<AppModelType, DbModelType>(),
    CollectionReducerInitialState,
  )

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error)
      dispatch({ type: 'error', error })
    },
    [onError],
  )

  useCustomCompareEffect(
    () => {
      if (!query) {
        dispatch({ type: 'disable' })
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined
      }
      return onSnapshot(
        query,
        (snapshot) => {
          try {
            const data = snapshot.docs.map((doc) => doc.data())
            dispatch({ type: 'data', snapshot, data })
          } catch (error) {
            handleError(error)
          }
        },
        handleError,
      )
    },
    [query],
    (prev, next) => isFirestoreQueryEqual(prev[0], next[0]),
    [handleError],
  )

  return state
}
