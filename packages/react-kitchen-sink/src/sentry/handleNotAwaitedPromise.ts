import { type CaptureContext } from '@sentry/core'
import { captureException } from '@sentry/react'

export const handleNotAwaitedPromise = <T>(promise: Promise<T> | undefined, context?: CaptureContext): void => {
  if (promise !== undefined && 'catch' in promise && typeof promise.catch === 'function') {
    promise.catch((error: unknown) => {
      captureException(error, context)
    })
  }
}
