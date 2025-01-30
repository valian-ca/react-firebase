import { useCallback, useReducer } from 'react'

import { type DocumentData, type DocumentReference, onSnapshot } from '@firebase/firestore'

import {
  DocumentReducerInitialState,
  type DocumentReducerState,
  documentStateReducer,
} from './support/documentStateReducer'
import { useCustomCompareEffect } from './support/useCustomCompareEffect'

export interface UseDocumentOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  ref: DocumentReference<AppModelType, DbModelType> | null | undefined
  onError?: (error: unknown) => void
}

export type UseDocumentResult<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> = DocumentReducerState<AppModelType, DbModelType>

export const useDocument = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>({
  ref,
  onError,
}: UseDocumentOptions<AppModelType, DbModelType>): UseDocumentResult<AppModelType, DbModelType> => {
  const [state, dispatch] = useReducer(documentStateReducer<AppModelType, DbModelType>(), DocumentReducerInitialState)

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error)
      dispatch({ type: 'error', error })
    },
    [onError],
  )

  useCustomCompareEffect(
    () => {
      if (!ref) {
        dispatch({ type: 'disable' })
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined
      }
      return onSnapshot(
        ref,
        (snapshot) => {
          const exists = snapshot.exists()
          if (!exists) {
            dispatch({ type: 'doesNotExist', snapshot })
            return
          }
          try {
            const data = snapshot.data()
            dispatch({ type: 'data', snapshot, data })
          } catch (error) {
            handleError(error)
          }
        },
        handleError,
      )
    },
    [ref],
    (prev, next) => prev[0]?.path === next[0]?.path,
    [handleError],
  )

  return state
}
