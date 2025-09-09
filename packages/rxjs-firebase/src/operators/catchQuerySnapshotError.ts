import { type DocumentData } from '@firebase/firestore'
import { catchError, Observable, type OperatorFunction } from 'rxjs'

import { type QuerySnapshotDataState, type QuerySnapshotErrorState } from '../states/QuerySnapshotState'

const ERROR_STATE = new Observable<QuerySnapshotErrorState>((subscriber) => {
  subscriber.next({
    size: 0,
    empty: true,
    isLoading: false,
    hasError: true,
    disabled: false,
    data: [],
  })
})

export const catchQuerySnapshotError = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  State extends QuerySnapshotDataState<AppModelType, DbModelType> = QuerySnapshotDataState<AppModelType, DbModelType>,
>(): OperatorFunction<State, State | QuerySnapshotErrorState> => catchError(() => ERROR_STATE)
