import { type Query, type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'
import { querySnapshotQueryOptions } from '../querySnapshotQueryOptions'

describe('querySnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'], snapshotOptions, listener })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.querySnapshotSubjectFactory).toHaveBeenCalledWith(query, snapshotOptions, listener)
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('sets staleTime to static when snapshot is alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(true)
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(Infinity)
  })

  it('sets staleTime to 0 when snapshot is not alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(false)
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(0)
  })
})
