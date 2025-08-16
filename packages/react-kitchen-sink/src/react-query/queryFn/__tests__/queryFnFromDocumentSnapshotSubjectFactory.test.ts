import { type DocumentSnapshot } from '@firebase/firestore'
import { type QueryClient, type QueryFunctionContext } from '@tanstack/react-query'
import { type DocumentSnapshotState } from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { queryFnFromDocumentSnapshotSubjectFactory } from '../queryFnFromDocumentSnapshotSubjectFactory'

class MockDocumentSnapshotSubject<T> extends Subject<DocumentSnapshotState<T>> {
  close = vi.fn()
}

describe('queryFnFromDocumentSnapshotSubjectFactory', () => {
  it('returns loading state when waitForData is false', async () => {
    const subject = new MockDocumentSnapshotSubject()
    const queryFn = queryFnFromDocumentSnapshotSubjectFactory(vi.fn().mockReturnValue(subject))
    const queryClient = mock<QueryClient>()
    const result = await queryFn(mock<QueryFunctionContext>({ client: queryClient }))
    expect(result).toEqual({ isLoading: true, hasError: false, disabled: false })
    expect(subject.close).not.toHaveBeenCalled()
  })

  it('waits for non-loading snapshot when waitForData is true', async () => {
    const queryKey = ['k']
    const subject = new MockDocumentSnapshotSubject()
    const queryFn = queryFnFromDocumentSnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
      waitForDataTimeout: 1000,
    })
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ client: queryClient, queryKey }))

    subject.next({ isLoading: true, hasError: false, disabled: false })
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKey, {
      isLoading: true,
      hasError: false,
      disabled: false,
    })

    const snapshot = mock<DocumentSnapshot>()
    setTimeout(() => {
      subject.next({
        isLoading: false,
        hasError: false,
        disabled: false,
        exists: true,
        data: {},
        snapshot,
      })
    }, 0)
    const result = await promise
    expect(result).toMatchObject({
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: true,
      data: {},
      snapshot,
    })
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKey, {
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: true,
      data: {},
      snapshot,
    })
  })

  it('rejects when waitForData times out before data', async () => {
    const subject = new MockDocumentSnapshotSubject()
    const queryFn = queryFnFromDocumentSnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
      waitForDataTimeout: 0,
    })
    const queryClient = mock<QueryClient>()
    await expect(queryFn(mock<QueryFunctionContext>({ client: queryClient, queryKey: ['k'] }))).rejects.toThrow()
  })

  it('uses default timeout when waitForDataTimeout is not provided and resolves before default timer', async () => {
    const subject = new MockDocumentSnapshotSubject()
    const queryFn = queryFnFromDocumentSnapshotSubjectFactory(vi.fn().mockReturnValue(subject), {
      waitForData: true,
    })
    const queryClient = mock<QueryClient>()
    const promise = queryFn(mock<QueryFunctionContext>({ client: queryClient, queryKey: ['k'] }))
    const snapshot = mock<DocumentSnapshot>()
    setTimeout(() => {
      subject.next({
        isLoading: false,
        hasError: false,
        disabled: false,
        exists: true,
        data: {},
        snapshot,
      })
    }, 0)
    await expect(promise).resolves.toMatchObject({ isLoading: false, hasError: false, disabled: false })
  })
})
