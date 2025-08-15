import { type QuerySnapshot } from '@firebase/firestore'
import { type QueryClient, type QueryFunctionContext } from '@tanstack/react-query'
import { type QuerySnapshotState } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { queryFnFromQuerySnapshotSubjectFactory } from '../queryFnFromQuerySnapshotSubjectFactory'

class MockQuerySnapshotSubject<T> extends Subject<QuerySnapshotState<T>> {
  close = vi.fn()
}

describe('queryFnFromQuerySnapshotSubjectFactory', () => {
  it('returns disabled state immediately when signal is already aborted', async () => {
    const subjectFactory = vi.fn()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(subjectFactory)
    const controller = new AbortController()
    controller.abort()
    const queryClient = mock<QueryClient>()
    const result = await queryFn(
      mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient, queryKey: ['k'] }),
    )
    expect(result).toEqual({
      empty: true,
      size: 0,
      isLoading: false,
      hasError: false,
      disabled: true,
      data: [],
    })
    expect(subjectFactory).not.toHaveBeenCalled()
  })
  it('returns loading state when waitForData is false', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject))
    const controller = new AbortController()
    const queryClient = mock<QueryClient>()
    const result = await queryFn(mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient }))
    expect(result).toEqual({
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    })
    expect(subject.close).not.toHaveBeenCalled()
  })

  it('closes subject on abort', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject))
    const controller = new AbortController()
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient }))
    controller.abort()
    await promise
    expect(subject.close).toHaveBeenCalled()
  })

  it('waits for non-loading snapshot when waitForData is true', async () => {
    const queryKey = ['k']
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
      waitForDataTimeout: 1000,
    })
    const controller = new AbortController()
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient, queryKey }))

    subject.next({
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    } as QuerySnapshotState)
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKey, {
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    })
    const snapshot = mock<QuerySnapshot>()
    setTimeout(() => {
      subject.next({
        empty: false,
        size: 1,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: [{}],
        snapshot,
      })
    }, 0)
    const result = await promise
    expect(result).toMatchObject({
      empty: false,
      size: 1,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{}],
      snapshot,
    })
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKey, {
      empty: false,
      size: 1,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{}],
      snapshot,
    })
  })

  it('rejects when waitForData times out before data', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
      waitForDataTimeout: 0,
    })
    const controller = new AbortController()
    const queryClient = mock<QueryClient>()
    await expect(
      queryFn(mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient, queryKey: ['k'] })),
    ).rejects.toThrow()
  })

  it('uses default timeout when waitForDataTimeout is not provided and resolves before default timer', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject), { waitForData: true })
    const controller = new AbortController()
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ signal: controller.signal, client: queryClient }))
    setTimeout(() => {
      subject.next({
        empty: false,
        size: 1,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: [{}],
        snapshot: mock<QuerySnapshot>(),
      })
    }, 0)
    await expect(promise).resolves.toMatchObject({ isLoading: false, disabled: false })
  })
})
