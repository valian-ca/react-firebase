import { type DocumentSnapshot } from '@firebase/firestore'
import { QueryClient } from '@tanstack/react-query'
import { fromDocumentRef } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, mockDeep } from 'vitest-mock-extended'
import { type CollectionSchema, type SingleDocumentCollectionFactory } from 'zod-firebase'

import { schemaSingleDocumentSnapshotQueryOptions } from '../schemaSingleDocumentSnapshotQueryOptions'

vi.mock('@valian/rxjs-firebase', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@valian/rxjs-firebase')>()
  return {
    ...actual,
    fromDocumentRef: vi.fn(),
  }
})

describe('schemaSingleDocumentSnapshotQueryOptions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('should return a snapshot when factory is provided', async () => {
    const factory = mockDeep<SingleDocumentCollectionFactory<CollectionSchema>>()
    factory.read.doc.mockReturnValue(mock())
    const subject = new Subject<DocumentSnapshot>()
    vi.mocked(fromDocumentRef).mockReturnValueOnce(subject)

    const options = schemaSingleDocumentSnapshotQueryOptions<CollectionSchema>({ factory, queryKey: ['schema-doc'] })
    const promise = queryClient.fetchQuery(options)

    const snapshot = mock<DocumentSnapshot>()
    snapshot.exists.mockReturnValue(true)
    snapshot.data.mockReturnValue({ foo: 'bar' })
    subject.next(snapshot)
    await expect(promise).resolves.toEqual({
      exists: true,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: { foo: 'bar' },
      snapshot,
    })
  })

  it('should pass snapshotOptions to factory.read.doc', async () => {
    const factory = mockDeep<SingleDocumentCollectionFactory<CollectionSchema>>()
    factory.read.doc.mockReturnValue(mock())
    const subject = new Subject<DocumentSnapshot>()
    vi.mocked(fromDocumentRef).mockReturnValueOnce(subject)

    const snapshotOptions = { includeMetadataChanges: true }
    const options = schemaSingleDocumentSnapshotQueryOptions<CollectionSchema>({
      factory,
      snapshotOptions,
      queryKey: ['schema-doc-options'],
    })
    const promise = queryClient.fetchQuery(options)

    const snapshot = mock<DocumentSnapshot>()
    snapshot.exists.mockReturnValue(true)
    snapshot.data.mockReturnValue({ foo: 'bar' })
    subject.next(snapshot)
    await promise

    expect(factory.read.doc).toHaveBeenCalledWith(snapshotOptions)
  })
})
