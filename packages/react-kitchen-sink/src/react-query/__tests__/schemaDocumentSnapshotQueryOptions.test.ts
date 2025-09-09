import { type DocumentSnapshot } from '@firebase/firestore'
import { QueryClient } from '@tanstack/react-query'
import { fromDocumentRef } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, mockDeep } from 'vitest-mock-extended'
import { type CollectionSchema, type SchemaFirestoreFactory } from 'zod-firebase'

import { schemaDocumentSnapshotQueryOptions } from '../schemaDocumentSnapshotQueryOptions'

vi.mock('@valian/rxjs-firebase', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@valian/rxjs-firebase')>()
  return {
    ...actual,
    fromDocumentRef: vi.fn(),
  }
})

describe('schemaDocumentSnapshotQueryOptions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('should return a snapshot when id and factory are provided', async () => {
    const factory = mockDeep<SchemaFirestoreFactory<CollectionSchema>>()
    factory.read.doc.mockReturnValue(mock())
    const subject = new Subject<DocumentSnapshot>()
    vi.mocked(fromDocumentRef).mockReturnValueOnce(subject)

    const options = schemaDocumentSnapshotQueryOptions<CollectionSchema>({ factory, id: '1', queryKey: ['schema-doc'] })
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

  it('should return disabled state when id is null', async () => {
    const factory = mock<SchemaFirestoreFactory<CollectionSchema>>()
    const options = schemaDocumentSnapshotQueryOptions<CollectionSchema>({
      factory,
      id: null as unknown as string,
      enabled: true,
      queryKey: ['schema-doc-empty'],
    })
    await expect(queryClient.fetchQuery(options)).resolves.toMatchObject({ disabled: true })
  })
})
