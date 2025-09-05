import { type DocumentData, type QueryDocumentSnapshot } from '@firebase/firestore'
import { GeoPoint, Timestamp } from 'firebase/firestore'

const handleFirestoreDataTypes = <T>(value: T): T => {
  switch (true) {
    case value instanceof Date:
      return value
    case value instanceof GeoPoint:
      return value
    case value instanceof Timestamp:
      return value.toDate() as T
    case typeof value === 'string':
      return value
    case Array.isArray(value):
      return value.map((v) => handleFirestoreDataTypes(v) as T[keyof T]) as T
    case value instanceof Object:
      return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, handleFirestoreDataTypes(v)])) as T
    default:
      return value
  }
}

export const firestoreDataConverter = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  snapshot: QueryDocumentSnapshot<AppModelType, DbModelType>,
) => handleFirestoreDataTypes(snapshot.data())
