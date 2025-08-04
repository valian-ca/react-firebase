import {
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  onSnapshot,
  type SnapshotListenOptions,
} from '@firebase/firestore'
import { Observable } from 'rxjs'

export function fromDocumentRef<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  ref: DocumentReference<AppModelType, DbModelType>,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  options: SnapshotListenOptions = { includeMetadataChanges: false },
): Observable<DocumentSnapshot<AppModelType, DbModelType>> {
  return new Observable((subscriber) => {
    const unsubscribe = onSnapshot(ref, options, {
      next: subscriber.next.bind(subscriber),
      error: subscriber.error.bind(subscriber),
      complete: subscriber.complete.bind(subscriber),
    })
    return { unsubscribe }
  })
}
