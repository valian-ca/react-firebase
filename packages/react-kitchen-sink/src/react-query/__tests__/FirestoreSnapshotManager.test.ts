import { type DocumentReference, type Query } from '@firebase/firestore'
import { captureMessage } from '@sentry/react'
import { type QueryCache, type QueryCacheNotifyEvent, type QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { anyFunction, mock } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { FirestoreSnapshotManager } from '../FirestoreSnapshotManager'

vi.mock('@sentry/react', () => ({
  captureMessage: vi.fn(),
}))
vi.mock('@valian/rxjs-firebase', () => ({
  fromDocumentRef: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  fromQuery: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  DocumentSnapshotSubject: class {
    close = vi.fn()
    subscribe = vi.fn()
  },
  QuerySnapshotSubject: class {
    close = vi.fn()
    subscribe = vi.fn()
  },
}))

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('FirestoreSnapshotManager', () => {
  const subscribers: Array<(e: QueryCacheNotifyEvent) => void> = []
  const queryClient = mock<QueryClient>()

  beforeEach(() => {
    subscribers.length = 0
    const queryCache = mock<QueryCache>()
    queryClient.getQueryCache.mockReturnValue(queryCache)
    queryCache.subscribe.mockImplementation((cb: (e: QueryCacheNotifyEvent) => void) => {
      subscribers.push(cb)
      return vi.fn()
    })
  })

  it('documentSnapshotSubjectFactory registers and closes on removal', () => {
    const queryKey = ['a', { b: 1 }]
    const manager = new FirestoreSnapshotManager(queryClient)
    const ref = mock<DocumentReference>({ id: 'doc' })
    const subject = manager.documentSnapshotSubjectFactory(ref)(queryKey)

    // simulate removal
    const event = {
      type: 'removed',
      query: { meta: { type: 'snapshot' }, queryKey },
    } as unknown as QueryCacheNotifyEvent

    subscribers.forEach((cb) => {
      cb(event)
    })
    expect(subject.close).toHaveBeenCalled()
  })

  it('querySnapshotSubjectFactory registers and closes on removal', () => {
    const queryKey = ['query']
    const manager = new FirestoreSnapshotManager(queryClient)
    const query = mock<Query>()
    const subject = manager.querySnapshotSubjectFactory(query)(queryKey)

    // simulate removal
    const event = {
      type: 'removed',
      query: { meta: { type: 'snapshot' }, queryKey },
    } as unknown as QueryCacheNotifyEvent

    subscribers.forEach((cb) => {
      cb(event)
    })
    expect(subject.close).toHaveBeenCalled()
  })

  it('re-registering same key closes previous subject', () => {
    const manager = new FirestoreSnapshotManager(queryClient)
    const ref = mock<DocumentReference>({ id: 'doc' })
    const factory = manager.documentSnapshotSubjectFactory(ref)
    const queryKey = ['same']
    const subject1 = factory(queryKey)
    const subject2 = factory(queryKey)
    expect(subject1.close).toHaveBeenCalled()
    expect(subject2.close).not.toHaveBeenCalled()
  })

  it('schema schemaDocumentSnapshotSubjectFactory produce subjects and register closures', () => {
    const manager = new FirestoreSnapshotManager(queryClient)
    const registerSnapshotOnClose = vi.spyOn(manager, 'registerSnapshotOnClose')
    vi.spyOn(collections.users.read, 'doc').mockReturnValue(mock<DocumentReference>({ id: 'id' }))
    const subject = manager.schemaDocumentSnapshotSubjectFactory(collections.users, 'id')(['key'])
    expect(registerSnapshotOnClose).toHaveBeenCalledWith(['key'], anyFunction())

    // simulate removal
    const event = {
      type: 'removed',
      query: { meta: { type: 'snapshot' }, queryKey: ['key'] },
    } as unknown as QueryCacheNotifyEvent

    subscribers.forEach((cb) => {
      cb(event)
    })
    expect(subject.close).toHaveBeenCalled()
  })

  it('schema schemaQuerySnapshotSubjectFactory produce subjects and register closures', () => {
    const manager = new FirestoreSnapshotManager(queryClient)
    const registerSnapshotOnClose = vi.spyOn(manager, 'registerSnapshotOnClose')
    vi.spyOn(collections.users, 'prepare').mockReturnValue(mock<Query>())
    const subject = manager.schemaQuerySnapshotSubjectFactory(collections.users, { name: 'q' })(['key'])
    expect(registerSnapshotOnClose).toHaveBeenCalledWith(['key'], anyFunction())

    // simulate removal
    const event = {
      type: 'removed',
      query: { meta: { type: 'snapshot' }, queryKey: ['key'] },
    } as unknown as QueryCacheNotifyEvent

    subscribers.forEach((cb) => {
      cb(event)
    })
    expect(subject.close).toHaveBeenCalled()
  })

  it('logs a warning when trying to close an unknown snapshot key', () => {
    // eslint-disable-next-line no-new
    new FirestoreSnapshotManager(queryClient)

    // simulate removal
    const badEvent = {
      type: 'removed',
      query: { meta: { type: 'snapshot' }, queryKey: ['badkey'] },
    } as unknown as QueryCacheNotifyEvent

    subscribers.forEach((cb) => {
      cb(badEvent)
    })

    expect(captureMessage).toHaveBeenCalled()
    const messageArg = vi.mocked(captureMessage).mock.calls.at(-1)?.[0]
    expect(String(messageArg)).toMatch(/Subscription for key/)
  })
})
