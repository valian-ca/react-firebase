import { type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { anyFunction, mock } from 'vitest-mock-extended'
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

  it('calls documentSnapshotQueryOptions with null ref when id is null', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: null,
      queryKey: ['test-key'],
      snapshotOptions,
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: null,
      snapshotOptions,
      queryKey: ['test-key'],
    })
  })

  it('calls documentSnapshotQueryOptions with null ref when id is undefined', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: undefined,
      queryKey: ['test-key'],
      snapshotOptions,
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: null,
      snapshotOptions,
      queryKey: ['test-key'],
    })
  })

  it('calls documentSnapshotQueryOptions with null ref when id is empty string', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: '',
      queryKey: ['test-key'],
      snapshotOptions,
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: null,
      snapshotOptions,
      queryKey: ['test-key'],
    })
  })

  it('calls documentSnapshotQueryOptions without snapshotOptions when not provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })

    vi.spyOn(collections.users.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: 'test-id',
      queryKey: ['test-key'],
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: mockRef,
      snapshotOptions: undefined,
      queryKey: ['test-key'],
    })
  })

  it('calls documentSnapshotQueryOptions without listener when not provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })
    const snapshotOptions = mock<SnapshotListenOptions>()

    vi.spyOn(collections.users.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: 'test-id',
      queryKey: ['test-key'],
      snapshotOptions,
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: mockRef,
      snapshotOptions,
      queryKey: ['test-key'],
      listener: undefined,
    })
  })

  it('passes through additional props to documentSnapshotQueryOptions', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })

    vi.spyOn(collections.users.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: 'test-id',
      queryKey: ['test-key'],
      select: (data) => data,
      throwOnError: true,
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: mockRef,
      snapshotOptions: undefined,
      queryKey: ['test-key'],
      select: anyFunction(),
      throwOnError: true,
    })
  })

  it('handles factory with different collection names', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })

    const customCollections = collectionsBuilder({
      posts: { zod: z.object({ title: z.string() }) },
    })

    vi.spyOn(customCollections.posts.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: customCollections.posts,
      id: 'test-id',
      queryKey: ['test-key'],
    })

    expect(documentSnapshotQueryOptions).toHaveBeenCalledWith(snapshotManager, {
      ref: mockRef,
      snapshotOptions: undefined,
      queryKey: ['test-key'],
    })
  })

  it('calls factory.read.doc with correct parameters', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const mockRef = mock<DocumentReference>({ id: 'test-id' })

    const docSpy = vi.spyOn(collections.users.read, 'doc').mockReturnValue(mockRef)

    schemaDocumentSnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      id: 'test-id',
      queryKey: ['test-key'],
      snapshotOptions,
    })

    expect(docSpy).toHaveBeenCalledWith('test-id', snapshotOptions)
  })
})
