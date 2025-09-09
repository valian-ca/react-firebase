import { type DocumentData } from '@firebase/firestore'
import { firstValueFrom, map, type Observable, skipWhile, takeUntil, timer } from 'rxjs'

import { type DocumentSnapshotState, type QuerySnapshotState } from '../states'

export const waitForData = <
  T extends DocumentSnapshotState<AppModelType, DbModelType> | QuerySnapshotState<AppModelType, DbModelType>,
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
>(
  observable: Observable<T>,
  timeout = 10_000,
): Promise<Exclude<T, { isLoading: true; disabled: true }>> =>
  firstValueFrom(
    observable.pipe(
      takeUntil(timer(timeout)),
      skipWhile(({ isLoading, disabled }) => isLoading || disabled),
      map((data) => data as Exclude<T, { isLoading: true; disabled: true }>),
    ),
  )
