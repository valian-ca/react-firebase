import { type DocumentReference, type DocumentSnapshot } from '@firebase/firestore'
import { QueryClient } from '@tanstack/react-query'
import { fromDocumentRef } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { documentSnapshotQueryOptions } from '../documentSnapshotQueryOptions'

vi.mock('@valian/rxjs-firebase', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@valian/rxjs-firebase')>()
  return {
    ...actual,
    fromDocumentRef: vi.fn(),
  }
})

describe('documentSnapshotQueryOptions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('should return a snapshot when ref is provided', async () => {
    const subject = new Subject<DocumentSnapshot>()
    vi.mocked(fromDocumentRef).mockReturnValueOnce(subject)

    const options = documentSnapshotQueryOptions({ ref: stub<DocumentReference>(), queryKey: ['doc'] })
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

  it('should return disabled state when ref is null', async () => {
    const options = documentSnapshotQueryOptions({ ref: null, enabled: true, queryKey: ['doc-empty'] })
    await expect(queryClient.fetchQuery(options)).resolves.toMatchObject({ disabled: true })
  })
})
