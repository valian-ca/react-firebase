import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DocumentSnapshotStateListener, DocumentSnapshotSubject, fromDocumentRef } from '@valian/rxjs-firebase'

import { sentryDocumentSnapshotListener } from '../sentry/sentryDocumentSnapshotListener'

export const documentSnapshotSubject = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  ref: DocumentReference<AppModelType, DbModelType>,
  options?: SnapshotListenOptions,
  listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
) => new DocumentSnapshotSubject(fromDocumentRef(ref, options), sentryDocumentSnapshotListener(ref, listener))
