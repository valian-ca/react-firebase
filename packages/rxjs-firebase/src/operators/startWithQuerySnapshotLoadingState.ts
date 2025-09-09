import { type DocumentData } from '@firebase/firestore'
import { type OperatorFunction, startWith } from 'rxjs'

import {
  type QuerySnapshotDataState,
  type QuerySnapshotErrorState,
  type QuerySnapshotLoadingState,
} from '../states/QuerySnapshotState'

export const startWithQuerySnapshotLoadingState =
  <
    AppModelType = DocumentData,
    DbModelType extends DocumentData = DocumentData,
    State extends QuerySnapshotDataState<AppModelType, DbModelType> | QuerySnapshotErrorState =
      | QuerySnapshotDataState<AppModelType, DbModelType>
      | QuerySnapshotErrorState,
  >(): OperatorFunction<State, State | QuerySnapshotLoadingState> =>
  (source$) =>
    source$.pipe(
      startWith({
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      } as const satisfies QuerySnapshotLoadingState),
    )
