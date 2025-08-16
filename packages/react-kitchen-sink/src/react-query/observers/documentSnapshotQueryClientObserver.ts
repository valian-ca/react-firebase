import { type DocumentData } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { type QueryClient, type QueryKey } from '@tanstack/react-query'
import { type DocumentSnapshotState } from '@valian/rxjs-firebase'
import { type Observer } from 'rxjs'

export const documentSnapshotQueryClientObserver = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  client: QueryClient,
  queryKey: QueryKey,
): Observer<DocumentSnapshotState<AppModelType, DbModelType>> => ({
  next: (snapshotState) => {
    client.setQueryData<DocumentSnapshotState<AppModelType, DbModelType>>(queryKey, snapshotState)
  },
  error: (error) => {
    captureException(error)
    client.setQueryData<DocumentSnapshotState<AppModelType, DbModelType>>(queryKey, {
      isLoading: false,
      hasError: true,
      disabled: false,
    })
  },
  complete: () => {
    addBreadcrumb({
      level: 'debug',
      message: 'Query snapshot query completed',
      data: {
        queryKey,
      },
    })
  },
})
