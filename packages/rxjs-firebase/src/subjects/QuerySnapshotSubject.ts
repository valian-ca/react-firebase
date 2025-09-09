import { type DocumentData, type Query, type QuerySnapshot, type SnapshotListenOptions } from '@firebase/firestore'
import { BehaviorSubject, type Observable, Subject, takeUntil } from 'rxjs'

import { querySnapshotState, type QuerySnapshotStateListener } from '../operators/querySnapshotState'
import { fromQuery } from '../source/fromQuery'
import { type QuerySnapshotState } from '../states'

export class QuerySnapshotSubject<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends BehaviorSubject<QuerySnapshotState<AppModelType, DbModelType>> {
  private notification$ = new Subject<void>()

  constructor(
    snapshot$: Observable<QuerySnapshot<AppModelType, DbModelType>>,
    listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
  ) {
    super({
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    })
    snapshot$.pipe(takeUntil(this.notification$), querySnapshotState(listener)).subscribe(this)
  }

  get data(): AppModelType[] {
    return this.value.data
  }

  complete(): void {
    this.notification$.next()
    this.notification$.complete()
    super.complete()
  }

  static fromQuery<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
    options?: SnapshotListenOptions,
    listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
  ): QuerySnapshotSubject<AppModelType, DbModelType> {
    return new QuerySnapshotSubject(fromQuery(query, options), listener)
  }
}
