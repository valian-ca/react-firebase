import { type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { documentSnapshotQueryOptions } from '../documentSnapshotQueryOptions'
import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'
import { schemaDocumentSnapshotQueryOptions } from '../schemaDocumentSnapshotQueryOptions'

vi.mock('../documentSnapshotQueryOptions', () => ({
  documentSnapshotQueryOptions: vi.fn(),
}))

const UserZod = z.object({
  name: z.string(),
  email: z.email(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaDocumentSnapshotQueryOptions', () => {
  it('calls documentSnapshotQueryOptions with correct parameters', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<DocumentSnapshotStateListener>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })

    const creatRefSpy = vi.spyOn(collections.users.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: 'test-id',
      queryKey: ['test-key'],
      snapshotOptions,
      listener,
    })

    expect(creatRefSpy).toHaveBeenCalledWith('test-id', snapshotOptions)

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: mockRef,
      snapshotOptions,
      queryKey: ['test-key'],
      listener,
    })
  })
})
