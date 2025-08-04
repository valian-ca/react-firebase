import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { BehaviorSubject, firstValueFrom, map, type Observable, skipWhile, Subject, takeUntil, timer } from 'rxjs'

import { documentSnapshotState, type DocumentStateOptions } from '../operators'
import { type DocumentSnapshotState } from '../states'
import { DocumentSnapshotInitialState } from '../states/DocumentSnapshotInitialState'

export class DocumentSnapshotSubject<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends BehaviorSubject<DocumentSnapshotState<AppModelType, DbModelType>> {
  private notification$ = new Subject<void>()

  constructor(
    snapshot$: Observable<DocumentSnapshot<AppModelType, DbModelType>>,
    options: DocumentStateOptions<AppModelType, DbModelType>,
  ) {
    super({ ...DocumentSnapshotInitialState })
    snapshot$.pipe(takeUntil(this.notification$), documentSnapshotState(options)).subscribe(this)
  }

  exsits(timeout = 10_000): Promise<boolean> {
    return firstValueFrom(
      this.pipe(
        takeUntil(timer(timeout)),
        skipWhile(({ isLoading }) => isLoading),
        map(({ exists }) => !!exists),
      ),
    )
  }

  get data(): AppModelType | undefined {
    return this.value.data
  }

  close(): void {
    this.notification$.next()
    this.notification$.complete()
  }
}
