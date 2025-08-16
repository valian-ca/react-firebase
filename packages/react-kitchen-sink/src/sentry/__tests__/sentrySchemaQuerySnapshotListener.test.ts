import { type QuerySnapshot } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { sentrySchemaQuerySnapshotListener } from '../sentrySchemaQuerySnapshotListener'

vi.mock('@sentry/react', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}))

describe('sentrySchemaQuerySnapshotListener', () => {
  const query = mock<{ name: string }>()
  query.name = 'q'

  it('forwards calls and adds breadcrumbs/captures errors', () => {
    const onSnapshot = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()
    const listener = sentrySchemaQuerySnapshotListener('c', query, { onSnapshot, onError, onComplete })

    listener.onSnapshot?.({
      isLoading: false,
      hasError: false,
      disabled: false,
      empty: true,
      size: 0,
      data: [],
      snapshot: stub<QuerySnapshot>(),
    } as const)
    expect(onSnapshot).toHaveBeenCalled()
    expect(addBreadcrumb).toHaveBeenCalled()

    const error = new Error('x')
    listener.onError?.(error)
    expect(onError).toHaveBeenCalledWith(error)
    expect(captureException).toHaveBeenCalled()

    listener.onComplete?.()
    expect(onComplete).toHaveBeenCalled()
    expect(addBreadcrumb).toHaveBeenCalled()
  })
})
