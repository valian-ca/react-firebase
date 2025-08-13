import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { BehaviorSubject, firstValueFrom, map, type Observable, skipWhile, Subject, takeUntil, timer } from 'rxjs'

import { documentSnapshotState, type DocumentSnapshotStateListener } from '../operators'
import { type DocumentSnapshotState } from '../states'

export class DocumentSnapshotSubject<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends BehaviorSubject<DocumentSnapshotState<AppModelType, DbModelType>> {
  private notification$ = new Subject<void>()

  constructor(
    snapshot$: Observable<DocumentSnapshot<AppModelType, DbModelType>>,
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
  ) {
    super({
      isLoading: true,
      hasError: false,
      disabled: false,
    })
    snapshot$.pipe(takeUntil(this.notification$), documentSnapshotState(listener)).subscribe(this)
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
