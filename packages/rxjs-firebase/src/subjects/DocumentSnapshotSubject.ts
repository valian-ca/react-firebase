import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { BehaviorSubject, type Observable, Subject, takeUntil } from 'rxjs'

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

  get data(): AppModelType | undefined {
    return this.value.data
  }

  complete(): void {
    this.notification$.next()
    this.notification$.complete()
    super.complete()
  }
}
