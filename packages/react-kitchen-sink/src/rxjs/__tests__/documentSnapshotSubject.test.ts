import { type DocumentReference } from '@firebase/firestore'
import { DocumentSnapshotSubject } from '@valian/rxjs-firebase'
import { describe, expect, it, vi } from 'vitest'
import { anyObject, mock } from 'vitest-mock-extended'

import { documentSnapshotSubject } from '../documentSnapshotSubject'

describe('documentSnapshotSubject', () => {
  it('creates a DocumentSnapshotSubject with sentry listener', () => {
    vi.spyOn(DocumentSnapshotSubject, 'fromDocumentRef')
    const ref = mock<DocumentReference>({ path: '/c/id' })
    const subject = documentSnapshotSubject(ref)
    expect(DocumentSnapshotSubject.fromDocumentRef).toHaveBeenCalledWith(ref, undefined, anyObject())
    expect(subject).toBeInstanceOf(DocumentSnapshotSubject)
  })
})
