import { type DocumentData } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { type QueryClient, type QueryKey } from '@tanstack/react-query'
import { type QuerySnapshotState } from '@valian/rxjs-firebase'
import { type Observer } from 'rxjs'

export const querySnapshotQueryClientObserver = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  client: QueryClient,
  queryKey: QueryKey,
): Observer<QuerySnapshotState<AppModelType, DbModelType>> => ({
  next: (snapshotState) => {
    client.setQueryData<QuerySnapshotState<AppModelType, DbModelType>>(queryKey, snapshotState)
  },
  error: (error) => {
    captureException(error)
    client.setQueryData<QuerySnapshotState<AppModelType, DbModelType>>(queryKey, {
      empty: true,
      size: 0,
      isLoading: false,
      hasError: true,
      disabled: false,
      data: [],
    })
  },
  complete: () => {
    addBreadcrumb({
      level: 'debug',
      message: 'Document snapshot query completed',
      data: {
        queryKey,
      },
    })
  },
})
