import { type Query, type QuerySnapshot, type SnapshotListenOptions } from '@firebase/firestore'
import { TestScheduler } from 'rxjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { fromQuery } from '../../source'
import { type QuerySnapshotState } from '../../states'
import { querySnapshot } from '../querySnapshot'

vi.mock('../../source/fromQuery')

describe('querySnapshot operator', () => {
  let testScheduler: TestScheduler

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
    vi.clearAllMocks()
  })

  it('emits disabled start, then loading and data states when query is provided', () => {
    testScheduler.run(({ cold, flush }) => {
      const q = mock<Query>()
      const snapshot = mock<QuerySnapshot>({
        size: 2,
        empty: false,
        docs: [{ data: () => ({ id: '1' }) }, { data: () => ({ id: '2' }) }],
      })

      vi.mocked(fromQuery).mockReturnValue(cold('-s|', { s: snapshot }))

      const source$ = cold('a----|', { a: q })
      const result$ = source$.pipe(querySnapshot())

      const disabled: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      }
      const loading: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      }
      const withData: QuerySnapshotState = {
        snapshot,
        size: 2,
        empty: false,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: [{ id: '1' }, { id: '2' }],
      }

      const events: QuerySnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()

      expect(events).toEqual([disabled, loading, withData])
      expect(completed).toBe(true)
    })
  })

  it('emits disabled state when input query is null or undefined', () => {
    testScheduler.run(({ cold, flush }) => {
      const source$ = cold('ab|', { a: null, b: undefined })
      const result$ = source$.pipe(querySnapshot())

      const disabled: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      }

      const events: QuerySnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()

      expect(events).toEqual([disabled, disabled, disabled])
      expect(completed).toBe(true)
    })
  })

  it('forwards options to fromQuery', () => {
    testScheduler.run(({ cold, flush }) => {
      const q = mock<Query>()
      const emptySnapshot = mock<QuerySnapshot>({ size: 0, empty: true, docs: [] })
      const options: SnapshotListenOptions = { includeMetadataChanges: true }

      const spy = vi.mocked(fromQuery).mockReturnValue(cold('-e|', { e: emptySnapshot }))

      const source$ = cold('a----|', { a: q })
      const result$ = source$.pipe(querySnapshot(undefined, options))

      const disabled: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      }
      const loading: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      }
      const emptyState: QuerySnapshotState = {
        snapshot: emptySnapshot,
        size: 0,
        empty: true,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: [],
      }

      const events: QuerySnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()
      expect(events).toEqual([disabled, loading, emptyState])
      expect(completed).toBe(true)
      expect(spy).toHaveBeenCalledWith(q, options)
    })
  })

  it('invokes listener callbacks (onSnapshot and onComplete); onError is invoked on errors', () => {
    testScheduler.run(({ cold, flush }) => {
      const q = mock<Query>()
      const snapshot = mock<QuerySnapshot>({ size: 1, empty: false, docs: [{ data: () => ({ id: '1' }) }] })

      const onSnapshot = vi.fn()
      const onError = vi.fn()
      const onComplete = vi.fn()

      vi.mocked(fromQuery).mockReturnValue(cold('s|', { s: snapshot }))

      const source$ = cold('a---|', { a: q })
      const result$ = source$.pipe(querySnapshot({ onSnapshot, onError, onComplete }))

      const disabled: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      }
      const loading: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      }

      const events: QuerySnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()

      expect(events[0]).toEqual(disabled)
      expect(events[1]).toEqual(loading)
      expect(events[2]).toEqual(
        expect.objectContaining({ size: 1, empty: false, isLoading: false, hasError: false, data: [{ id: '1' }] }),
      )
      expect(completed).toBe(true)

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({ size: 1, empty: false, isLoading: false, hasError: false, data: [{ id: '1' }] }),
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  it('handles inner errors and produces error state while calling onError', () => {
    testScheduler.run(({ cold, flush }) => {
      const q = mock<Query>()
      const error = new Error('boom')

      const onError = vi.fn()

      vi.mocked(fromQuery).mockReturnValue(cold('#', {}, error))

      const source$ = cold('a|', { a: q })
      const result$ = source$.pipe(querySnapshot({ onError }))

      const disabled: QuerySnapshotState = {
        empty: true,
        size: 0,
        isLoading: false,
        hasError: false,
        disabled: true,
        data: [],
      }
      const errorState: QuerySnapshotState = {
        size: 0,
        empty: true,
        isLoading: false,
        hasError: true,
        disabled: false,
        data: [],
      }

      const events: QuerySnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()
      expect(events[0]).toEqual(disabled)
      expect(events[1]).toEqual({ empty: true, size: 0, isLoading: true, hasError: false, disabled: false, data: [] })
      expect(events[2]).toEqual(errorState)
      expect(completed).toBe(true)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
