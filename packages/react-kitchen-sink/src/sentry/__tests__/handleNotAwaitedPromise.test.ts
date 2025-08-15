import { captureException } from '@sentry/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleNotAwaitedPromise } from '../handleNotAwaitedPromise'

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}))

describe('handleNotAwaitedPromise', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures rejection errors', async () => {
    const error = new Error('boom')
    handleNotAwaitedPromise(Promise.reject(error))
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    expect(captureException).toHaveBeenCalledWith(error, undefined)
  })

  it('does nothing when promise is undefined', () => {
    const promise = undefined
    handleNotAwaitedPromise(promise)
    expect(captureException).not.toHaveBeenCalled()
  })

  it('does nothing when object has no catch', () => {
    // eslint-disable-next-line unicorn/no-thenable, @typescript-eslint/no-empty-function
    handleNotAwaitedPromise({ then: () => {} } as unknown as Promise<void>)
    expect(captureException).not.toHaveBeenCalled()
  })
})
