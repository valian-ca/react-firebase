import { QuerySnapshotSubject } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { anyObject } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { schemaQuerySnapshotSubject } from '../schemaQuerySnapshotSubject'

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaQuerySnapshotSubject', () => {
  it('creates a QuerySnapshotSubject from factory.prepare', () => {
    vi.spyOn(QuerySnapshotSubject, 'fromQuery')
    vi.spyOn(collections.users, 'prepare').mockReturnValue({ id: 'q' })
    const subject = schemaQuerySnapshotSubject(collections.users, { name: 'q' })
    expect(collections.users.prepare).toHaveBeenCalled()
    expect(QuerySnapshotSubject.fromQuery).toHaveBeenCalledWith({ id: 'q' }, undefined, anyObject())
    expect(subject).toBeInstanceOf(QuerySnapshotSubject)
  })
})
