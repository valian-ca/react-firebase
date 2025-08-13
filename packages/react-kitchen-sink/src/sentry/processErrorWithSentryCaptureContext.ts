import { type ErrorEvent } from '@sentry/react'

import { ErrorWithSentryCaptureContext } from './ErrorWithSentryCaptureContext'

export const processErrorWithSentryCaptureContext = (event: ErrorEvent, exception: unknown) => {
  if (exception instanceof ErrorWithSentryCaptureContext) {
    exception.beforeSend(event)
    if (exception.cause) {
      processErrorWithSentryCaptureContext(event, exception.cause)
    }
  }
}
