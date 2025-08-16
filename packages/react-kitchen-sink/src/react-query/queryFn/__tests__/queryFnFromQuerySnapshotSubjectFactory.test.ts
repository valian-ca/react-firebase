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
  it('returns loading state when waitForData is false', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject))
    const queryClient = mock<QueryClient>()
    const result = await queryFn(mock<QueryFunctionContext>({ client: queryClient }))
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

  it('waits for non-loading snapshot when waitForData is true', async () => {
    const queryKey = ['k']
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
      waitForDataTimeout: 1000,
    })
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ client: queryClient, queryKey }))

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
    const queryClient = mock<QueryClient>()
    await expect(queryFn(mock<QueryFunctionContext>({ client: queryClient, queryKey: ['k'] }))).rejects.toThrow()
  })

  it('uses default timeout when waitForDataTimeout is not provided and resolves before default timer', async () => {
    const subject = new MockQuerySnapshotSubject()
    const queryFn = queryFnFromQuerySnapshotSubjectFactory(vi.fn().mockReturnValue(subject), { waitForData: true })
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ client: queryClient }))
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
