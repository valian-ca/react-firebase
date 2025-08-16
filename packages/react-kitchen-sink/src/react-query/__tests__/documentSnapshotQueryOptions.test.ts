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

  it('sets staleTime to static when snapshot is alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(true)
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe('static')
  })

  it('sets staleTime to 0 when snapshot is not alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(false)
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(0)
  })
})
