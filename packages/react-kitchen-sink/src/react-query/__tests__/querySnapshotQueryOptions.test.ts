import { type Query as FirestoreQuery, type QuerySnapshot } from '@firebase/firestore'
import { QueryClient } from '@tanstack/react-query'
import { fromQuery } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { querySnapshotQueryOptions } from '../querySnapshotQueryOptions'

vi.mock('@valian/rxjs-firebase', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@valian/rxjs-firebase')>()
  return {
    ...actual,
    fromQuery: vi.fn(),
  }
})

describe('querySnapshotQueryOptions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.useFakeTimers()
    Date.now = vi.fn(() => 1_482_363_367_071)
  })

  it('should return a snapshot when query is provided', async () => {
    const subject = new Subject<QuerySnapshot>()
    vi.mocked(fromQuery).mockReturnValueOnce(subject)

    const options = querySnapshotQueryOptions({ query: stub<FirestoreQuery>(), queryKey: ['q'] })
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
    const options = querySnapshotQueryOptions({ query: null, enabled: true, queryKey: ['q-empty'] })
    await expect(queryClient.fetchQuery(options)).resolves.toMatchObject({ disabled: true })
  })

  it('should return a snapshot when queryFn is provided', async () => {
    const subject = new Subject<QuerySnapshot>()
    const queryFn = vi.fn().mockReturnValue(stub<FirestoreQuery>())
    vi.mocked(fromQuery).mockReturnValueOnce(subject)

    const options = querySnapshotQueryOptions({ queryFn, queryKey: ['q-fn'] })
    const promise = queryClient.fetchQuery(options)

    const snapshot = mock<QuerySnapshot>({
      size: 1,
      empty: false,
      docs: [{ data: () => ({ id: '1' }) }],
    })
    subject.next(snapshot)
    await expect(promise).resolves.toEqual({
      snapshot,
      size: 1,
      empty: false,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{ id: '1' }],
    })
    expect(queryFn).toHaveBeenCalledOnce()
  })
})
