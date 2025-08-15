import { type ErrorEvent } from '@sentry/core'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { ErrorWithSentryCaptureContext } from '../ErrorWithSentryCaptureContext'

describe('ErrorWithSentryCaptureContext', () => {
  it('sets name from cause and merges capture context into event in beforeSend', () => {
    const cause = new TypeError('type-err')
    const error = new ErrorWithSentryCaptureContext(
      'boom',
      {
        extra: { a: 1 },
        tags: { t: 'x' },
        contexts: { ctx: { b: 2 } },
        fingerprint: ['f'],
      },
      { cause },
    )

    expect(error.name).toBe('TypeError')

    const event = error.beforeSend(
      mock<ErrorEvent>({
        exception: { values: [] },
        extra: { base: true },
        tags: { base: 't' },
        contexts: { base: { c: 3 } },
      }),
    )

    expect(event.extra).toMatchObject({ base: true, a: 1 })
    expect(event.tags).toMatchObject({ base: 't', t: 'x' })
    expect(event.contexts).toMatchObject({ base: { c: 3 }, ctx: { b: 2 } })
    expect(event.fingerprint).toEqual(['f'])
  })
})
