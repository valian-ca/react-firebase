import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'
import { BehaviorSubject, type Observable, Subject, takeUntil } from 'rxjs'

import { querySnapshotState, type QuerySnapshotStateListener } from '../operators'
import { type QuerySnapshotState } from '../states'

export class QuerySnapshotSubject<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends BehaviorSubject<QuerySnapshotState<AppModelType, DbModelType>> {
  private notification$ = new Subject<void>()

  constructor(
    snapshot$: Observable<QuerySnapshot<AppModelType, DbModelType>>,
    options?: QuerySnapshotStateListener<AppModelType, DbModelType>,
  ) {
    super({
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    })
    snapshot$.pipe(takeUntil(this.notification$), querySnapshotState(options)).subscribe(this)
  }

  get data(): AppModelType[] {
    return this.value.data
  }

  close(): void {
    this.notification$.next()
    this.notification$.complete()
  }
}
