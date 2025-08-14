import { type DocumentData, type DocumentReference } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'

export const sentryDocumentSnapshotListener = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  ref: DocumentReference<AppModelType, DbModelType>,
  listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
): DocumentSnapshotStateListener<AppModelType, DbModelType> => ({
  onSnapshot: (state) => {
    listener?.onSnapshot?.(state)
    addBreadcrumb({
      category: 'firestore',
      message: `received document snapshot for (${ref.path})`,
      data: {
        state,
      },
    })
  },
  onError: (error) => {
    listener?.onError?.(error)
    captureException(error, {
      tags: { firestore: true, 'schema.collection': ref.parent.id },
      fingerprint: ['firestore', ref.parent.id],
      contexts: {
        snapshot: {
          ref,
        },
      },
    })
  },
  onComplete: () => {
    listener?.onComplete?.()
    addBreadcrumb({
      category: 'firestore',
      message: `closed document snapshot for (${ref.path})`,
    })
  },
})
