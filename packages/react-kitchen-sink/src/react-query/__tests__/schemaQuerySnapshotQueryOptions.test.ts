import { type SnapshotListenOptions } from '@firebase/firestore'
import { queryOptions } from '@tanstack/react-query'
import { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import { describe, expect, it } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

import { type FirestoreSnapshotManager } from '../FirestoreSnapshotManager'
import { schemaQuerySnapshotQueryOptions } from '../schemaQuerySnapshotQueryOptions'

const UserZod = z.object({
  name: z.string(),
})

const collections = collectionsBuilder({
  users: { zod: UserZod },
})

describe('schemaQuerySnapshotQueryOptions', () => {
  it('builds query options with meta and queryFn from manager factory', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      snapshotOptions,
      listener,
    })

    expect(opts.queryKey).toEqual(queryOptions({ queryKey: ['k'] }).queryKey)
    expect(snapshotManager.schemaQuerySnapshotSubjectFactory).toHaveBeenCalledWith(
      collections.users,
      { name: 'q' },
      snapshotOptions,
      listener,
    )
    expect(opts.meta?.type).toBe('snapshot')
  })

  it('sets staleTime to static when snapshot is alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(true)
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
    })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(Infinity)
  })

  it('sets staleTime to 0 when snapshot is not alive', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    snapshotManager.isSnapshotAlive.mockReturnValue(false)
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
    })

    expect(typeof opts.staleTime).toBe('function')
    expect((opts.staleTime as () => string | number)()).toBe(0)
  })

  it('sets enabled to false when query is null', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: null,
      queryKey: ['k'],
    })

    expect(opts.enabled).toBe(false)
  })

  it('sets enabled to false when query is undefined', async () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: undefined,
      queryKey: ['k'],
    })
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
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
    })

    expect(opts.enabled).toBe(true)
  })

  it('sets retry to false', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
    })

    expect(opts.retry).toBe(false)
  })

  it('sets gcTime to 10000', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
    })

    expect(opts.gcTime).toBe(10_000)
  })

  it('includes all meta properties when query is provided', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const customMeta = { custom: 'value' }
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta).toEqual({
      ...customMeta,
      type: 'snapshot',
      snapshotManager,
      collection: collections.users.collectionName,
      schemaQuery: { name: 'q' },
    })
  })

  it('preserves custom meta properties', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const customMeta = { custom: 'value', another: 'prop' }
    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      meta: customMeta,
    })

    expect(opts.meta?.custom).toBe('value')
    expect(opts.meta?.another).toBe('prop')
    expect(opts.meta?.type).toBe('snapshot')
    expect(opts.meta?.collection).toBe(collections.users.collectionName)
  })

  it('calls schemaQuerySnapshotSubjectFactory with correct parameters', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()
    const snapshotOptions = mock<SnapshotListenOptions>()
    const listener = mock<QuerySnapshotStateListener>()

    schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      snapshotOptions,
      listener,
    })

    expect(snapshotManager.schemaQuerySnapshotSubjectFactory).toHaveBeenCalledWith(
      collections.users,
      { name: 'q' },
      snapshotOptions,
      listener,
    )
  })

  it('handles undefined snapshotOptions and listener gracefully', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()

    expect(() => {
      schemaQuerySnapshotQueryOptions(snapshotManager, {
        factory: collections.users,
        query: { name: 'q' },
        queryKey: ['k'],
      })
    }).not.toThrow()

    expect(snapshotManager.schemaQuerySnapshotSubjectFactory).toHaveBeenCalledWith(
      collections.users,
      { name: 'q' },
      undefined,
      undefined,
    )
  })

  it('spreads additional props correctly', () => {
    const snapshotManager = mock<FirestoreSnapshotManager>()

    const opts = schemaQuerySnapshotQueryOptions(snapshotManager, {
      factory: collections.users,
      query: { name: 'q' },
      queryKey: ['k'],
      select: (data) => data,
      throwOnError: true,
    })

    expect(opts.select).toBeDefined()
    expect(opts.throwOnError).toBe(true)
  })
})
