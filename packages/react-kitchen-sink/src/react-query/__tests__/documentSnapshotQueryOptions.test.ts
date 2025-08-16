import { type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { documentSnapshotQueryOptions } from '../documentSnapshotQueryOptions'
import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'

describe('documentSnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<DocumentSnapshotStateListener>()
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'], snapshotOptions, listener })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.documentSnapshotSubjectFactory).toHaveBeenCalledWith(ref, snapshotOptions, listener)
    expect(opts.meta?.type).toBe('snapshot')
  })
})
