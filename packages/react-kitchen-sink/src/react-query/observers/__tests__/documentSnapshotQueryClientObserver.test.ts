import { type QueryClient } from '@tanstack/react-query'
import { type DocumentSnapshotState } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { documentSnapshotQueryClientObserver } from '../documentSnapshotQueryClientObserver'

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }))

describe('documentSnapshotQueryClientObserver', () => {
  it('sets data on next, error and complete', () => {
    const client = mock<QueryClient>({ setQueryData: vi.fn() })
    const queryKey = ['k']
    const observer = documentSnapshotQueryClientObserver(client, queryKey)

    observer.next({ isLoading: false, hasError: false, disabled: false } as DocumentSnapshotState)
    expect(client.setQueryData).toHaveBeenCalled()

    observer.error(new Error('x'))
    expect(client.setQueryData).toHaveBeenCalledWith(queryKey, {
      isLoading: false,
      hasError: true,
      disabled: false,
    })

    observer.complete()
    expect(client.setQueryData).toHaveBeenCalledWith(queryKey, {
      isLoading: false,
      hasError: false,
      disabled: true,
    })
  })
})
