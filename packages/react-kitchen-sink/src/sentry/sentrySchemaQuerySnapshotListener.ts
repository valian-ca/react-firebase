import { type DocumentData } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import { type QuerySpecification } from 'zod-firebase'

export const sentrySchemaQuerySnapshotListener = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  collection: string,
  query: QuerySpecification,
  listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
): QuerySnapshotStateListener<AppModelType, DbModelType> => ({
  onSnapshot: (state) => {
    listener?.onSnapshot?.(state)
    addBreadcrumb({
      category: 'firestore',
      message: `received query snapshot for (${query.name})`,
      data: {
        state,
      },
    })
  },
  onError: (error) => {
    listener?.onError?.(error)
    captureException(error, {
      tags: { firestore: true, 'schema.collection': collection },
      fingerprint: ['firestore', collection],
      contexts: {
        query: {
          query,
        },
      },
    })
  },
  onComplete: () => {
    listener?.onComplete?.()
    addBreadcrumb({
      category: 'firestore',
      message: `closed query snapshot for (${query.name})`,
    })
  },
})
