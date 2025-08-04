import {
  type DocumentData,
  onSnapshot,
  type Query,
  type QuerySnapshot,
  type SnapshotListenOptions,
} from '@firebase/firestore'
import { Observable } from 'rxjs'

export function fromQuery<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  ref: Query<AppModelType, DbModelType>,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  options: SnapshotListenOptions = { includeMetadataChanges: false },
): Observable<QuerySnapshot<AppModelType, DbModelType>> {
  return new Observable((subscriber) => {
    const unsubscribe = onSnapshot(ref, options, {
      next: subscriber.next.bind(subscriber),
      error: subscriber.error.bind(subscriber),
      complete: subscriber.complete.bind(subscriber),
    })
    return { unsubscribe }
  })
}
