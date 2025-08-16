import { type ErrorEvent } from '@sentry/react'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { ErrorWithSentryCaptureContext } from '../ErrorWithSentryCaptureContext'
import { processErrorWithSentryCaptureContext } from '../processErrorWithSentryCaptureContext'

describe('processErrorWithSentryCaptureContext', () => {
  it('applies beforeSend and recurses into cause', () => {
    const event = mock<ErrorEvent>()
    const cause = new ErrorWithSentryCaptureContext('cause', {})
    const causeSpy = vi.spyOn(cause, 'beforeSend')
    const error = new ErrorWithSentryCaptureContext('root', {}, { cause })
    const spy = vi.spyOn(error, 'beforeSend')

    processErrorWithSentryCaptureContext(event, error)

    expect(spy).toHaveBeenCalledWith(event)
    expect(causeSpy).toHaveBeenCalledWith(event)
  })

  it('ignores non-enhanced errors', () => {
    const event = mock<ErrorEvent>()
    expect(() => {
      processErrorWithSentryCaptureContext(event, new Error('x'))
    }).not.toThrow()
  })
})
