import { type DocumentData } from '@firebase/firestore'
import { catchError, Observable, type OperatorFunction } from 'rxjs'

import {
  type DocumentDoesNotExistState,
  type DocumentSnapshotDataState,
  type DocumentSnapshotErrorState,
} from '../states/DocumentSnapshotState'

const ERROR_STATE = new Observable<DocumentSnapshotErrorState>((subscriber) => {
  subscriber.next({
    isLoading: false,
    hasError: true,
    disabled: false,
  })
})

export const catchDocumentSnapshotError = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TState extends
    | DocumentSnapshotDataState<AppModelType, DbModelType>
    | DocumentDoesNotExistState<AppModelType, DbModelType> =
    | DocumentSnapshotDataState<AppModelType, DbModelType>
    | DocumentDoesNotExistState<AppModelType, DbModelType>,
>(): OperatorFunction<TState, TState | DocumentSnapshotErrorState> => catchError(() => ERROR_STATE)
