import { createContext } from 'react'

import { type DocumentData } from 'firebase/firestore'

import { createQuerySnapshotStore } from '../store/createQuerySnapshotStore'

export const createQuerySnapshotStoreContext = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>() => createContext(createQuerySnapshotStore<AppModelType, DbModelType>())
