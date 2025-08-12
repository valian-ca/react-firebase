import { createContext } from 'react'

import { type DocumentData } from 'firebase/firestore'

import { createDocumentSnapshotStore } from '../store/createDocumentSnapshotStore'

export const createDocumentSnapshotStoreContext = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>() => createContext(createDocumentSnapshotStore<AppModelType, DbModelType>())
