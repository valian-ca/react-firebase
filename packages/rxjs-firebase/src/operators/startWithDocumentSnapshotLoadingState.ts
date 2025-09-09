import { type DocumentData } from '@firebase/firestore'
import { type OperatorFunction, startWith } from 'rxjs'

import {
  type DocumentDoesNotExistState,
  type DocumentSnapshotDataState,
  type DocumentSnapshotErrorState,
  type DocumentSnapshotLoadingState,
} from '../states/DocumentSnapshotState'

export const startWithDocumentSnapshotLoadingState =
  <
    AppModelType = DocumentData,
    DbModelType extends DocumentData = DocumentData,
    State extends
      | DocumentSnapshotDataState<AppModelType, DbModelType>
      | DocumentDoesNotExistState<AppModelType, DbModelType>
      | DocumentSnapshotErrorState =
      | DocumentSnapshotDataState<AppModelType, DbModelType>
      | DocumentDoesNotExistState<AppModelType, DbModelType>
      | DocumentSnapshotErrorState,
  >(): OperatorFunction<State, State | DocumentSnapshotLoadingState> =>
  (source$) =>
    source$.pipe(
      startWith({
        isLoading: true,
        hasError: false,
        disabled: false,
      } as const satisfies DocumentSnapshotLoadingState),
    )
