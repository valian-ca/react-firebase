import { type DocumentData, type Query, queryEqual } from '@firebase/firestore'

export const isFirestoreQueryEqual = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  prev: Query<AppModelType, DbModelType> | undefined | null,
  next: Query<AppModelType, DbModelType> | undefined | null,
) => prev === next || (!!prev && !!next && queryEqual(prev, next))
