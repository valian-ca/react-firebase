import { type DocumentData } from '@firebase/firestore'
import { Observable } from 'rxjs'

import { type DocumentSnapshotState } from '../states/DocumentSnapshotState'

export const documentSnapshotStateObservable = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  state: DocumentSnapshotState<AppModelType, DbModelType>,
): Observable<DocumentSnapshotState<AppModelType, DbModelType>> =>
  new Observable((subscriber) => {
    subscriber.next(state)
  })
