import { type DocumentReference } from '@firebase/firestore'
import { DocumentSnapshotSubject, fromDocumentRef } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { documentSnapshotSubject } from '../documentSnapshotSubject'

vi.mock('@valian/rxjs-firebase', () => ({
  fromDocumentRef: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  DocumentSnapshotSubject: class {
    close = vi.fn()
    subscribe = vi.fn()
  },
}))

describe('documentSnapshotSubject', () => {
  it('creates a DocumentSnapshotSubject with sentry listener', () => {
    const ref = mock<DocumentReference>({ path: '/c/id' })
    const subject = documentSnapshotSubject(ref)
    expect(fromDocumentRef).toHaveBeenCalledWith(ref, undefined)
    expect(subject).toBeInstanceOf(DocumentSnapshotSubject)
  })
})
