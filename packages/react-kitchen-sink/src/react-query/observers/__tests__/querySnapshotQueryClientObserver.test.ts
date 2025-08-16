import { type QueryClient } from '@tanstack/react-query'
import { type QuerySnapshotState } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { querySnapshotQueryClientObserver } from '../querySnapshotQueryClientObserver'

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }))

describe('querySnapshotQueryClientObserver', () => {
  it('sets data on next, error and complete', () => {
    const client = mock<QueryClient>({ setQueryData: vi.fn() })
    const queryKey = ['k']
    const observer = querySnapshotQueryClientObserver(client, queryKey)

    observer.next({
      empty: false,
      size: 1,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{}],
    } as QuerySnapshotState)
    expect(client.setQueryData).toHaveBeenCalled()

    observer.error(new Error('x'))
    expect(client.setQueryData).toHaveBeenCalledWith(queryKey, {
      empty: true,
      size: 0,
      isLoading: false,
      hasError: true,
      disabled: false,
      data: [],
    })

    observer.complete()
    expect(client.setQueryData).toHaveBeenCalledWith(queryKey, {
      empty: true,
      size: 0,
      isLoading: false,
      hasError: false,
      disabled: true,
      data: [],
    })
  })
})
