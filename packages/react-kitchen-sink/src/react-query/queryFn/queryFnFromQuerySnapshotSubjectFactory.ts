import { type DocumentData } from '@firebase/firestore'
import { type QueryFunction, type QueryKey } from '@tanstack/react-query'
import { type QuerySnapshotState, type QuerySnapshotSubject } from '@valian/rxjs-firebase'
import { firstValueFrom, skipWhile, takeUntil, timer } from 'rxjs'

import { querySnapshotQueryClientObserver } from '../observers/querySnapshotQueryClientObserver'

export interface QueryFnFromQuerySnapshotSubjectFactoryOptions {
  waitForData?: boolean
  waitForDataTimeout?: number
}

export const queryFnFromQuerySnapshotSubjectFactory =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData, TQueryKey extends QueryKey = QueryKey>(
    subjectFactory: (queryKey: TQueryKey) => QuerySnapshotSubject<AppModelType, DbModelType>,
    options?: QueryFnFromQuerySnapshotSubjectFactoryOptions,
  ): QueryFunction<QuerySnapshotState<AppModelType, DbModelType>, TQueryKey> =>
  async ({ client, queryKey, signal }) => {
    if (signal.aborted) {
      return {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      } as const
    }

    const subject$ = subjectFactory(queryKey)
    const subscription = subject$.subscribe(querySnapshotQueryClientObserver(client, queryKey))

    signal.addEventListener(
      'abort',
      () => {
        subscription.unsubscribe()
        subject$.close()
      },
      { once: true },
    )

    if (options?.waitForData) {
      return firstValueFrom(
        subject$.pipe(
          takeUntil(timer(options.waitForDataTimeout ?? 10_000)),
          skipWhile(({ isLoading }) => isLoading),
        ),
      )
    }

    return {
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    } as const
  }
