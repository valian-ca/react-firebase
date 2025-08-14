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
    const subject$ = subjectFactory(queryKey)
    subject$.subscribe(querySnapshotQueryClientObserver(client, queryKey))

    signal.addEventListener('abort', () => {
      subject$.close()
    })

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
