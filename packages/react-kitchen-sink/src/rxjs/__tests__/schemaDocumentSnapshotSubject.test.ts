import { type DocumentSnapshot } from '@firebase/firestore'
import { DocumentSnapshotSubject } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { anyObject, mock } from 'vitest-mock-extended'
import * as z from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { schemaDocumentSnapshotSubject } from '../schemaDocumentSnapshotSubject'

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaDocumentSnapshotSubject', () => {
  it('delegates to documentSnapshotSubject with factory.read.doc', () => {
    const documentSnapshot = mock<DocumentSnapshot>()
    vi.spyOn(DocumentSnapshotSubject, 'fromDocumentRef')
    vi.spyOn(collections.users.read, 'doc').mockReturnValue(documentSnapshot)
    const subject = schemaDocumentSnapshotSubject(collections.users, 'id')

    expect(collections.users.read.doc).toHaveBeenCalledWith('id', undefined)
    expect(DocumentSnapshotSubject.fromDocumentRef).toHaveBeenCalledWith(documentSnapshot, undefined, anyObject())
    expect(subject).toBeInstanceOf(DocumentSnapshotSubject)
  })
})
