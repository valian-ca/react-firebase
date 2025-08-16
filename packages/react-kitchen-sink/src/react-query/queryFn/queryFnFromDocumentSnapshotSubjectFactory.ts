import { type DocumentData } from '@firebase/firestore'
import { type QueryFunction, type QueryKey } from '@tanstack/react-query'
import { type DocumentSnapshotState, type DocumentSnapshotSubject } from '@valian/rxjs-firebase'
import { firstValueFrom, skipWhile, takeUntil, timer } from 'rxjs'

import { documentSnapshotQueryClientObserver } from '../observers/documentSnapshotQueryClientObserver'

export interface QueryFnFromDocumentSnapshotSubjectFactoryOptions {
  waitForData?: boolean
  waitForDataTimeout?: number
}

export const queryFnFromDocumentSnapshotSubjectFactory =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData, TQueryKey extends QueryKey = QueryKey>(
    subjectFactory: (queryKey: TQueryKey) => DocumentSnapshotSubject<AppModelType, DbModelType>,
    options?: QueryFnFromDocumentSnapshotSubjectFactoryOptions,
  ): QueryFunction<DocumentSnapshotState<AppModelType, DbModelType>, TQueryKey> =>
  async ({ client, queryKey, signal }) => {
    if (signal.aborted) {
      return {
        isLoading: false,
        hasError: false,
        disabled: true,
      } as const
    }

    const subject$ = subjectFactory(queryKey)
    const subscription = subject$.subscribe(documentSnapshotQueryClientObserver(client, queryKey))

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
      isLoading: true,
      hasError: false,
      disabled: false,
    } as const
  }
