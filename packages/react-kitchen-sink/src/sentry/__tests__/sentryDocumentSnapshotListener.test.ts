import { type DocumentReference, type DocumentSnapshot } from '@firebase/firestore'
import { addBreadcrumb, captureException } from '@sentry/react'
import { describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { sentryDocumentSnapshotListener } from '../sentryDocumentSnapshotListener'

vi.mock('@sentry/react', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}))

describe('sentryDocumentSnapshotListener', () => {
  const ref = mock<DocumentReference>({ path: '/c/id', parent: { id: 'c' } })

  it('forwards calls and adds breadcrumbs/captures errors', () => {
    const onSnapshot = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()
    const listener = sentryDocumentSnapshotListener(ref, { onSnapshot, onError, onComplete })

    listener.onSnapshot?.({
      isLoading: false,
      hasError: false,
      disabled: false,
      snapshot: stub<DocumentSnapshot>(),
      exists: true,
      data: {},
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
