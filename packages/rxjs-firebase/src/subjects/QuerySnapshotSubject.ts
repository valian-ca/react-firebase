import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'
import { BehaviorSubject, type Observable, Subject, takeUntil } from 'rxjs'

import { querySnapshotState, type QueryStateOptions } from '../operators'
import { type QuerySnapshotState } from '../states'
import { QuerySnapshotInitialState } from '../states/QuerySnapshotInitialState'

export class QuerySnapshotSubject<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends BehaviorSubject<QuerySnapshotState<AppModelType, DbModelType>> {
  private notification$ = new Subject<void>()

  constructor(
    snapshot$: Observable<QuerySnapshot<AppModelType, DbModelType>>,
    options: QueryStateOptions<AppModelType, DbModelType>,
  ) {
    super({ ...QuerySnapshotInitialState })
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
