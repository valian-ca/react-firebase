import { type QuerySnapshot } from '@firebase/firestore'
import { QueryClient } from '@tanstack/react-query'
import { fromQuery } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { type CollectionSchema, type SchemaFirestoreQueryFactory, type SchemaQuerySpecification } from 'zod-firebase'

import { schemaQuerySnapshotQueryOptions } from '../schemaQuerySnapshotQueryOptions'

vi.mock('@valian/rxjs-firebase', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@valian/rxjs-firebase')>()
  return {
    ...actual,
    fromQuery: vi.fn(),
  }
})

describe('schemaQuerySnapshotQueryOptions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.useFakeTimers()
    Date.now = vi.fn(() => 1_482_363_367_071)
  })

  it('should return a snapshot when query is provided', async () => {
    const factory = mock<SchemaFirestoreQueryFactory<CollectionSchema>>()
    factory.prepare.mockReturnValue(mock())
    const subject = new Subject<QuerySnapshot>()
    vi.mocked(fromQuery).mockReturnValueOnce(subject)

    const options = schemaQuerySnapshotQueryOptions({
      factory,
      query: mock<SchemaQuerySpecification<CollectionSchema>>(),
      queryKey: ['schema-q'],
    })
    const promise = queryClient.fetchQuery(options)

    const snapshot = mock<QuerySnapshot>({
      size: 2,
      empty: false,
      docs: [{ data: () => ({ id: '1' }) }, { data: () => ({ id: '2' }) }],
    })
    subject.next(snapshot)
    await expect(promise).resolves.toEqual({
      snapshot,
      size: 2,
      empty: false,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{ id: '1' }, { id: '2' }],
    })
  })

  it('should return disabled state when query is null', async () => {
    const factory = mock<SchemaFirestoreQueryFactory<CollectionSchema>>()
    const options = schemaQuerySnapshotQueryOptions<CollectionSchema>({
      factory,
      query: null,
      enabled: true,
      queryKey: ['schema-q-empty'],
    })
    await expect(queryClient.fetchQuery(options)).resolves.toMatchObject({ disabled: true })
  })
})
