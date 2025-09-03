import { type DocumentData } from '@firebase/firestore'
import { type Observable } from 'rxjs'

import { type DocumentSnapshotState } from '../states'

import { waitForData } from './waitForData'

export const documentExists = async <AppModelType, DbModelType extends DocumentData = DocumentData>(
  observable: Observable<DocumentSnapshotState<AppModelType, DbModelType>>,
  timeout = 10_000,
): Promise<boolean> => {
  const result = await waitForData(observable, timeout)
  return !!result.exists
}
