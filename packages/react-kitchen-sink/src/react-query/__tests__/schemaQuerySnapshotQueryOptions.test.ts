import { type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'
import { schemaQuerySnapshotQueryOptions } from '../schemaQuerySnapshotQueryOptions'

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaQuerySnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      snapshotOptions,
      listener,
    })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.schemaQuerySnapshotSubjectFactory).toHaveBeenCalledWith(
      collections.users,
      { name: 'q' },
      snapshotOptions,
      listener,
    )
    expect(opts.meta?.type).toBe('snapshot')
  })
})
