import { useMemo } from 'react'

import { type SnapshotListenOptions } from '@firebase/firestore'

export const useSnapshotListenOptions = ({
  includeMetadataChanges,
  source,
}: SnapshotListenOptions): SnapshotListenOptions =>
  useMemo(
    () => ({
      ...(includeMetadataChanges !== undefined ? { includeMetadataChanges } : {}),
      ...(source !== undefined ? { source } : {}),
    }),
    [includeMetadataChanges, source],
  )
