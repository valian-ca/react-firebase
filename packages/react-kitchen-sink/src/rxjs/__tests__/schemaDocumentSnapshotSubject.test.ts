import { type DocumentSnapshot } from '@firebase/firestore'
import { fromDocumentRef } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { schemaDocumentSnapshotSubject } from '../schemaDocumentSnapshotSubject'

vi.mock('@valian/rxjs-firebase', () => ({
  fromDocumentRef: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  DocumentSnapshotSubject: class {
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

describe('schemaDocumentSnapshotSubject', () => {
  it('delegates to documentSnapshotSubject with factory.read.doc', () => {
    const documentSnapshot = mock<DocumentSnapshot>()
    vi.spyOn(collections.users.read, 'doc').mockReturnValue(documentSnapshot)
    const subject = schemaDocumentSnapshotSubject(collections.users, 'id')

    expect(collections.users.read.doc).toHaveBeenCalledWith('id', undefined)
    expect(fromDocumentRef).toHaveBeenCalled()
    expect(subject).toHaveProperty('close')
  })
})
