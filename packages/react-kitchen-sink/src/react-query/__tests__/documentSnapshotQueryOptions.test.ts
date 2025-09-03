import { type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { documentSnapshotQueryOptions } from '../documentSnapshotQueryOptions'
import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'

describe('documentSnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<DocumentSnapshotStateListener>()
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'], snapshotOptions, listener })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.documentSnapshotSubjectFactory).toHaveBeenCalledWith(ref, snapshotOptions, listener)
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('sets staleTime to static when snapshot is alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(true)
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(Infinity)
  })

  it('sets staleTime to 0 when snapshot is not alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(false)
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(0)
  })

  it('sets enabled to true when ref is provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(opts.enabled).toBe(true)
  })

  it('sets enabled to false when ref is null', async () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref: null, queryKey: ['k'] })

    expect(opts.queryFn).toBeInstanceOf(Function)
    await expect(opts.queryFn?.(stub())).resolves.toEqual({
      isLoading: false,
      hasError: false,
      disabled: true,
    })

    expect(opts.enabled).toBe(false)
  })

  it('sets retry to false', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(opts.retry).toBe(false)
  })

  it('sets gcTime to 10000', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const opts = documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })

    expect(opts.gcTime).toBe(10_000)
  })

  it('includes all meta properties when ref is provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const customMeta = { custom: 'value' }
    const opts = documentSnapshotQueryOptions(snapshotManager, {
      ref,
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta).toEqual({
      ...customMeta,
      type: 'snapshot',
      snapshotManager,
      documentRef: ref,
    })
  })

  it('preserves custom meta properties', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const customMeta = { custom: 'value', another: 'prop' }
    const opts = documentSnapshotQueryOptions(snapshotManager, {
      ref,
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta?.custom).toBe('value')
    expect(opts.meta?.another).toBe('prop')
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('calls documentSnapshotSubjectFactory with correct parameters', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<DocumentSnapshotStateListener>()

    documentSnapshotQueryOptions(snapshotManager, {
      ref,
      queryKey: ['k'],
      snapshotOptions,
      listener,
    })

    expect(snapshotManager.documentSnapshotSubjectFactory).toHaveBeenCalledWith(ref, snapshotOptions, listener)
  })

  it('handles undefined snapshotOptions and listener gracefully', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const ref = mock<DocumentReference>({ id: 'r' })

    expect(() => {
      documentSnapshotQueryOptions(snapshotManager, { ref, queryKey: ['k'] })
    }).not.toThrow()

    expect(snapshotManager.documentSnapshotSubjectFactory).toHaveBeenCalledWith(ref, undefined, undefined)
  })
})
