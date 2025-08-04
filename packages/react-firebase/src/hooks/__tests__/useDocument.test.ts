import {
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type FirestoreError,
  onSnapshot,
  type SnapshotListenOptions,
  type Unsubscribe,
} from '@firebase/firestore'
import { renderHook, waitFor } from '@testing-library/react'
import { anyFunction, mock, type MockProxy } from 'jest-mock-extended'

import { useDocument, type UseDocumentOptions } from '../useDocument'

interface TestDocument {
  id: string
  name: string
  value: number
}

type OnTestDocumentSnapshot<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> = (
  reference: DocumentReference<AppModelType, DbModelType>,
  options: SnapshotListenOptions,
  onNext: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void,
) => Unsubscribe

describe('useDocument', () => {
  let mockRef: MockProxy<DocumentReference<TestDocument>>
  let onErrorCallback: jest.Mock

  beforeEach(() => {
    // Setup mocks
    mockRef = mock<DocumentReference<TestDocument>>()
    onErrorCallback = jest.fn()

    // Reset mocks
    onErrorCallback.mockReset()
  })

  describe('initial state', () => {
    it('should return loading state initially', () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
      }

      const { result } = renderHook(() => useDocument(options))

      expect(result.current).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: true,
        isDisabled: false,
        hasError: false,
        data: undefined,
      })
    })
  })

  describe('disabled state', () => {
    it('should return disabled state when ref is null', () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: null,
      }

      const { result } = renderHook(() => useDocument(options))

      expect(result.current).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: undefined,
      })
    })

    it('should return disabled state when ref is undefined', () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: undefined,
      }

      const { result } = renderHook(() => useDocument(options))

      expect(result.current).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: undefined,
      })
    })

    it('should not call onSnapshot when ref is null', () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: null,
      }

      renderHook(() => useDocument(options))

      expect(onSnapshot).not.toHaveBeenCalled()
    })

    it('should not call onSnapshot when ref is undefined', () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: undefined,
      }

      renderHook(() => useDocument(options))

      expect(onSnapshot).not.toHaveBeenCalled()
    })
  })

  describe('data state', () => {
    it('should return data state when document exists', async () => {
      const testData: TestDocument = { id: '1', name: 'Test Document', value: 42 }

      const mockSnapshot = mock<DocumentSnapshot<TestDocument>>()

      mockSnapshot.exists.mockReturnValue(true)
      mockSnapshot.data.mockReturnValue(testData)

      // Setup onSnapshot to call the success callback
      jest.mocked<OnTestDocumentSnapshot>(onSnapshot).mockImplementation((ref, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn() // Return unsubscribe function
      })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toEqual({
        snapshot: mockSnapshot,
        exists: true,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: testData,
      })

      expect(onSnapshot).toHaveBeenCalledWith(
        mockRef,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )
    })

    it('should handle includeMetadataChanges option', async () => {
      const testData: TestDocument = { id: '1', name: 'Test Document', value: 42 }

      const mockSnapshot = mock<DocumentSnapshot<TestDocument>>()

      mockSnapshot.exists.mockReturnValue(true)
      mockSnapshot.data.mockReturnValue(testData)

      jest.mocked<OnTestDocumentSnapshot>(onSnapshot).mockImplementation((ref, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn()
      })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
        includeMetadataChanges: true,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(onSnapshot).toHaveBeenCalledWith(mockRef, { includeMetadataChanges: true }, anyFunction(), anyFunction())
    })

    it('should handle document that does not exist', async () => {
      const mockSnapshot = mock<DocumentSnapshot<TestDocument>>()

      mockSnapshot.exists.mockReturnValue(false)

      jest
        .mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot)
        .mockImplementation((ref, options, successCallback) => {
          successCallback(mockSnapshot)
          return jest.fn()
        })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toEqual({
        snapshot: mockSnapshot,
        exists: false,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: undefined,
      })
    })
  })

  describe('error state', () => {
    it('should handle errors from onSnapshot', async () => {
      const testError = new Error('Firestore error') as FirestoreError

      jest
        .mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot)
        .mockImplementation((ref, options, successCallback, errorCallback) => {
          errorCallback?.(testError)
          return jest.fn()
        })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
        onError: onErrorCallback,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: undefined,
      })

      expect(onErrorCallback).toHaveBeenCalledWith(testError)
    })

    it('should handle errors during data processing', async () => {
      const testError = new Error('Data processing error')

      // Mock a snapshot that throws an error when .data() is called
      const mockSnapshot = {
        exists: () => true,
        data: () => {
          throw testError
        },
      } as unknown as DocumentSnapshot<TestDocument>

      jest
        .mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot)
        .mockImplementation((ref, options, successCallback) => {
          successCallback(mockSnapshot)
          return jest.fn()
        })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
        onError: onErrorCallback,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: undefined,
      })

      expect(onErrorCallback).toHaveBeenCalledWith(testError)
    })

    it('should handle errors when onError callback is not provided', async () => {
      const testError = new Error('Firestore error') as FirestoreError

      jest
        .mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot)
        .mockImplementation((ref, options, successCallback, errorCallback) => {
          errorCallback?.(testError)
          return jest.fn()
        })

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
        // No onError callback provided
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current.hasError).toBe(true)
      // Should not throw even without onError callback
    })
  })

  describe('ref changes', () => {
    it('should resubscribe when ref changes', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot).mockReturnValue(unsubscribeMock)

      const initialRef = mock<DocumentReference<TestDocument>>({
        path: '/documents/doc1',
      })
      const newRef = mock<DocumentReference<TestDocument>>({
        path: '/documents/doc2',
      })

      const options: UseDocumentOptions<TestDocument> = {
        ref: initialRef,
      }

      const { rerender } = renderHook(() => useDocument(options))

      // Initial render should call onSnapshot
      expect(onSnapshot).toHaveBeenCalledTimes(1)
      expect(onSnapshot).toHaveBeenCalledWith(
        initialRef,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )

      // Change the ref
      options.ref = newRef
      rerender()

      // Should unsubscribe from old ref and subscribe to new one
      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(onSnapshot).toHaveBeenCalledTimes(2)
      expect(onSnapshot).toHaveBeenLastCalledWith(
        newRef,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )
    })

    it('should not resubscribe when ref path is the same', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot).mockReturnValue(unsubscribeMock)

      const ref1 = mock<DocumentReference<TestDocument>>({
        path: '/documents/doc1',
      })
      const ref2 = mock<DocumentReference<TestDocument>>({
        path: '/documents/doc1',
      })

      const options: UseDocumentOptions<TestDocument> = {
        ref: ref1,
      }

      const { rerender } = renderHook(() => useDocument(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change to ref with same path
      options.ref = ref2
      rerender()

      // Should not resubscribe
      expect(unsubscribeMock).not.toHaveBeenCalled()
      expect(onSnapshot).toHaveBeenCalledTimes(1)
    })

    it('should handle change from valid ref to null', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
      }

      const { result, rerender } = renderHook(() => useDocument(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change to null ref
      options.ref = null
      rerender()

      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(result.current.isDisabled).toBe(true)
    })

    it('should handle change from null to valid ref', async () => {
      const options: UseDocumentOptions<TestDocument> = {
        ref: null,
      }

      const { result, rerender } = renderHook(() => useDocument(options))

      expect(result.current.isDisabled).toBe(true)
      expect(onSnapshot).not.toHaveBeenCalled()

      // Change to valid ref
      options.ref = mockRef
      rerender()

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isDisabled).toBe(false)
      })
    })
  })

  describe('cleanup', () => {
    it('should unsubscribe when component unmounts', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked<OnTestDocumentSnapshot<TestDocument>>(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseDocumentOptions<TestDocument> = {
        ref: mockRef,
      }

      const { unmount } = renderHook(() => useDocument(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      unmount()

      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('TypeScript types', () => {
    it('should work with custom types', async () => {
      interface CustomDocument {
        customField: string
        timestamp: Date
      }

      const customData: CustomDocument = { customField: 'test', timestamp: new Date() }

      const customSnapshot = mock<DocumentSnapshot<CustomDocument>>()
      customSnapshot.exists.mockReturnValue(true)
      customSnapshot.data.mockReturnValue(customData)

      jest
        .mocked<OnTestDocumentSnapshot<CustomDocument>>(onSnapshot)
        .mockImplementation((ref, options, successCallback) => {
          successCallback(customSnapshot)
          return jest.fn()
        })

      const customRef = mock<DocumentReference<CustomDocument>>()

      const options: UseDocumentOptions<CustomDocument> = {
        ref: customRef,
      }

      const { result } = renderHook(() => useDocument(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(customData)
      expect(result.current.data?.customField).toBe('test')
    })

    it('should work with DocumentData as default', async () => {
      const documentData = { anyField: 'value' }

      const snapshot = mock<DocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      snapshot.data.mockReturnValue(documentData)

      jest.mocked<OnTestDocumentSnapshot>(onSnapshot).mockImplementation((ref, options, successCallback) => {
        successCallback(snapshot)
        return jest.fn()
      })

      const ref = mock<DocumentReference>()

      const { result } = renderHook(() => useDocument({ ref }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(documentData)
    })
  })
})
