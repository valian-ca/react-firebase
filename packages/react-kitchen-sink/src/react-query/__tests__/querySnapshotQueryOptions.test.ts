import { type Query, type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'
import { querySnapshotQueryOptions } from '../querySnapshotQueryOptions'

describe('querySnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'], snapshotOptions, listener })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.querySnapshotSubjectFactory).toHaveBeenCalledWith(query, snapshotOptions, listener)
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('sets staleTime to static when snapshot is alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(true)
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(Infinity)
  })

  it('sets staleTime to 0 when snapshot is not alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(false)
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(0)
  })

  it('sets enabled to false when query is null', async () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query: null, queryKey: ['k'] })
    await expect(opts.queryFn?.(stub())).resolves.toEqual({
      data: [],
      disabled: true,
      empty: true,
      hasError: false,
      isLoading: false,
      size: 0,
    })

    expect(opts.enabled).toBe(false)
  })

  it('sets enabled to true when query is provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(opts.enabled).toBe(true)
  })

  it('sets retry to false', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(opts.retry).toBe(false)
  })

  it('sets gcTime to 10000', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(opts.gcTime).toBe(10_000)
  })

  it('sets initialData to undefined', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const opts = querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })

    expect(opts.initialData).toBeUndefined()
  })

  it('includes all meta properties when query is provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const customMeta = { custom: 'value' }
    const opts = querySnapshotQueryOptions(snapshotManager, {
      query,
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta).toEqual({
      ...customMeta,
      type: 'snapshot',
      snapshotManager,
      query,
    })
  })

  it('preserves custom meta properties', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const customMeta = { custom: 'value', another: 'prop' }
    const opts = querySnapshotQueryOptions(snapshotManager, {
      query,
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta?.custom).toBe('value')
    expect(opts.meta?.another).toBe('prop')
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('calls querySnapshotSubjectFactory with correct parameters', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()

    querySnapshotQueryOptions(snapshotManager, {
      query,
      queryKey: ['k'],
      snapshotOptions,
      listener,
    })

    expect(snapshotManager.querySnapshotSubjectFactory).toHaveBeenCalledWith(query, snapshotOptions, listener)
  })

  it('handles undefined snapshotOptions and listener gracefully', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()

    expect(() => {
      querySnapshotQueryOptions(snapshotManager, { query, queryKey: ['k'] })
    }).not.toThrow()

    expect(snapshotManager.querySnapshotSubjectFactory).toHaveBeenCalledWith(query, undefined, undefined)
  })

  it('spreads additional props correctly', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const query = mock<Query>()

    const opts = querySnapshotQueryOptions(snapshotManager, {
      query,
      queryKey: ['k'],
      select: (data) => data,
      throwOnError: true,
    })

    expect(opts.select).toBeDefined()
    expect(opts.throwOnError).toBe(true)
  })
})
