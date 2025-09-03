import { type DocumentData } from '@firebase/firestore'
import { Observable } from 'rxjs'

import { type QuerySnapshotState } from '../states/QuerySnapshotState'

export const querySnapshotStateObservable = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  state: QuerySnapshotState<AppModelType, DbModelType>,
): Observable<QuerySnapshotState<AppModelType, DbModelType>> =>
  new Observable((subscriber) => {
    subscriber.next(state)
  })
