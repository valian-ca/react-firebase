import { type QueryDocumentSnapshot } from '@firebase/firestore'
import { type ErrorEvent } from '@sentry/react'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { ZodSchemaError } from '../ZodSchemaError'

describe('ZodSchemaError', () => {
  it('sets message, name and captureContext with snapshot info', () => {
    // Use mock from vitest-mock-extended for snapshot
    const snapshot = mock<QueryDocumentSnapshot>({
      ref: { path: '/c/id', parent: { id: 'c' } },
      metadata: { hasPendingWrites: false, fromCache: false },
    })
    const error = new ZodSchemaError(snapshot)
    expect(error.name).toBe('ZodSchemaError')
    expect(error.message).toBe('Zod Error for /c/id')

    const event = error.beforeSend(mock<ErrorEvent>())
    expect(event.tags).toMatchObject({ firestore: true, 'schema.zod': true, 'schema.collection': 'c' })
    expect(event.fingerprint).toEqual(['schema', 'zod', 'c'])
    expect(event.contexts?.snapshot?.ref).toBe(snapshot.ref)
    expect(event.contexts?.snapshot?.metadata).toBe(snapshot.metadata)
  })
})
