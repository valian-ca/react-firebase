import { fromQuery, QuerySnapshotSubject } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { schemaQuerySnapshotSubject } from '../schemaQuerySnapshotSubject'

vi.mock('@valian/rxjs-firebase', () => ({
  fromQuery: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  QuerySnapshotSubject: class {
    close = vi.fn()
    subscribe = vi.fn()
  },
}))

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaQuerySnapshotSubject', () => {
  it('creates a QuerySnapshotSubject from factory.prepare', () => {
    vi.spyOn(collections.users, 'prepare').mockReturnValue({ id: 'q' })
    const subject = schemaQuerySnapshotSubject(collections.users, { name: 'q' })
    expect(collections.users.prepare).toHaveBeenCalled()
    expect(fromQuery).toHaveBeenCalled()
    expect(subject).toBeInstanceOf(QuerySnapshotSubject)
  })
})
