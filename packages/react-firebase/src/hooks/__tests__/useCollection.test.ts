import {
  type FirestoreError,
  onSnapshot,
  type Query,
  type QueryDocumentSnapshot,
  queryEqual,
  type QuerySnapshot,
} from '@firebase/firestore'
import { renderHook, waitFor } from '@testing-library/react'
import { anyFunction, mock, type MockProxy } from 'jest-mock-extended'

import { useCollection, type UseCollectionOptions } from '../useCollection'

interface TestDocument {
  id: string
  name: string
  value: number
}

describe('useCollection', () => {
  let mockQuery: MockProxy<Query<TestDocument>>
  let onErrorCallback: jest.Mock

  beforeEach(() => {
    // Setup mocks
    mockQuery = mock<Query<TestDocument>>()
    onErrorCallback = jest.fn()

    // Reset mocks
    onErrorCallback.mockReset()

    // Setup default behavior
    jest.mocked(queryEqual).mockReturnValue(false)
  })

  describe('initial state', () => {
    it('should return loading state initially', () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result } = renderHook(() => useCollection(options))

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: true,
        isDisabled: false,
        hasError: false,
        data: [],
        snapshot: undefined,
      })
    })
  })

  describe('disabled state', () => {
    it('should return disabled state when query is null', () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: null,
      }

      const { result } = renderHook(() => useCollection(options))

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: [],
        snapshot: undefined,
      })
    })

    it('should not call onSnapshot when query is null', () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: null,
      }

      renderHook(() => useCollection(options))

      expect(onSnapshot).not.toHaveBeenCalled()
    })

    it('should handle includeMetadataChanges option when query is null', () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: null,
        includeMetadataChanges: true,
      }

      const { result } = renderHook(() => useCollection(options))

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: [],
        snapshot: undefined,
      })
    })

    it('should handle initial state with null query and includeMetadataChanges', () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: null,
        includeMetadataChanges: false,
      }

      const { result } = renderHook(() => useCollection(options))

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: [],
        snapshot: undefined,
      })
    })
  })

  describe('data state', () => {
    it('should return data state when snapshot is received', async () => {
      const testData: TestDocument[] = [
        { id: '1', name: 'Test 1', value: 10 },
        { id: '2', name: 'Test 2', value: 20 },
      ]

      // Mock document objects
      const mockDocs = testData.map((item) => ({
        data: () => item,
      }))

      const mockSnapshot = mock<QuerySnapshot<TestDocument>>({
        docs: mockDocs,
        size: testData.length,
        empty: false,
      })

      // Setup onSnapshot to call the success callback
      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn() // Return unsubscribe function
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toEqual({
        empty: false,
        size: 2,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: testData,
        snapshot: mockSnapshot,
      })

      expect(onSnapshot).toHaveBeenCalledWith(
        mockQuery,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )
    })

    it('should handle includeMetadataChanges option', async () => {
      const testData: TestDocument[] = [{ id: '1', name: 'Test 1', value: 10 }]

      const mockDocs = testData.map((item) => ({
        data: () => item,
      }))

      const mockSnapshot = mock<QuerySnapshot<TestDocument>>({
        docs: mockDocs,
        size: testData.length,
        empty: false,
      })

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
        includeMetadataChanges: true,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(onSnapshot).toHaveBeenCalledWith(mockQuery, { includeMetadataChanges: true }, anyFunction(), anyFunction())
    })

    it('should handle empty collections', async () => {
      const mockSnapshot = {
        docs: [],
        size: 0,
        empty: true,
      } as unknown as QuerySnapshot<TestDocument>

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: [],
        snapshot: mockSnapshot,
      })
    })
  })

  describe('error state', () => {
    it('should handle errors from onSnapshot', async () => {
      const testError = mock<FirestoreError>()

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback, errorCallback) => {
        errorCallback?.(testError)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
        onError: onErrorCallback,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: [],
        snapshot: undefined,
      })

      expect(onErrorCallback).toHaveBeenCalledWith(testError)
    })

    it('should handle errors during data processing', async () => {
      const testError = new Error('Data processing error')

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback, errorCallback) => {
        errorCallback?.(testError as unknown as FirestoreError)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
        onError: onErrorCallback,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current).toEqual({
        empty: true,
        size: 0,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: [],
        snapshot: undefined,
      })

      expect(onErrorCallback).toHaveBeenCalledWith(testError)
    })

    it('should handle errors when onError callback is not provided', async () => {
      const testError = new Error('Firestore error')

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback, errorCallback) => {
        errorCallback?.(testError as FirestoreError)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
        // No onError callback provided
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current.hasError).toBe(true)
      // Should not throw even without onError callback
    })

    it('should handle errors when getting data from snapshot', async () => {
      // Mock document objects
      const mockDoc = mock<QueryDocumentSnapshot<TestDocument>>()
      mockDoc.data.mockImplementation(() => {
        throw new Error('test')
      })

      const mockSnapshot = mock<QuerySnapshot<TestDocument>>({
        docs: [mockDoc],
        size: 1,
        empty: false,
      })

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(mockSnapshot)
        return jest.fn()
      })

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current.hasError).toBe(true)
      // Should not throw even without onError callback
    })
  })

  describe('query changes', () => {
    it('should resubscribe when query changes', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const initialQuery = mock<Query<TestDocument>>()
      const newQuery = mock<Query<TestDocument>>()

      jest.mocked(queryEqual).mockReturnValue(false) // Queries are different

      const options: UseCollectionOptions<TestDocument> = {
        query: initialQuery,
      }

      const { rerender } = renderHook(() => useCollection(options))

      // Initial render should call onSnapshot
      expect(onSnapshot).toHaveBeenCalledTimes(1)
      expect(onSnapshot).toHaveBeenCalledWith(
        initialQuery,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )

      // Change the query
      options.query = newQuery
      rerender()

      // Should unsubscribe from old query and subscribe to new one
      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(onSnapshot).toHaveBeenCalledTimes(2)
      expect(onSnapshot).toHaveBeenLastCalledWith(
        newQuery,
        { includeMetadataChanges: undefined },
        anyFunction(),
        anyFunction(),
      )
    })

    it('should not resubscribe when query is equivalent', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const query1 = mock<Query<TestDocument>>()
      const query2 = mock<Query<TestDocument>>()

      jest.mocked(queryEqual).mockReturnValue(true) // Queries are equivalent

      const options: UseCollectionOptions<TestDocument> = {
        query: query1,
      }

      const { rerender } = renderHook(() => useCollection(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change to equivalent query
      options.query = query2
      rerender()

      // Should not resubscribe
      expect(unsubscribeMock).not.toHaveBeenCalled()
      expect(onSnapshot).toHaveBeenCalledTimes(1)
    })

    it('should handle change from valid query to null', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result, rerender } = renderHook(() => useCollection(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change to null query
      options.query = null
      rerender()

      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(result.current.isDisabled).toBe(true)
    })

    it('should handle change from valid query to null with includeMetadataChanges', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
        includeMetadataChanges: true,
      }

      const { result, rerender } = renderHook(() => useCollection(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)
      expect(onSnapshot).toHaveBeenCalledWith(mockQuery, { includeMetadataChanges: true }, anyFunction(), anyFunction())

      // Change to null query
      options.query = null
      rerender()

      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(result.current.isDisabled).toBe(true)
    })

    it('should handle change from null to valid query', async () => {
      const options: UseCollectionOptions<TestDocument> = {
        query: null,
      }

      const { result, rerender } = renderHook(() => useCollection(options))

      expect(result.current.isDisabled).toBe(true)
      expect(onSnapshot).not.toHaveBeenCalled()

      jest.mocked(queryEqual).mockReturnValue(false)
      // Change to valid query
      options.query = mockQuery
      rerender({ query: mockQuery })

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isDisabled).toBe(false)
      })
    })

    it('should handle multiple query changes to ensure effect callback execution', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { result, rerender } = renderHook(() => useCollection(options))

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change to null query
      options.query = null
      rerender()

      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
      expect(result.current.isDisabled).toBe(true)

      // Change back to valid query
      options.query = mockQuery
      rerender()

      expect(onSnapshot).toHaveBeenCalledTimes(2)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isDisabled).toBe(false)

      // Change to null again
      options.query = null
      rerender()

      expect(unsubscribeMock).toHaveBeenCalledTimes(2)
      expect(result.current.isDisabled).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should unsubscribe when component unmounts', () => {
      const unsubscribeMock = jest.fn()
      jest.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const options: UseCollectionOptions<TestDocument> = {
        query: mockQuery,
      }

      const { unmount } = renderHook(() => useCollection(options))

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

      const customData: CustomDocument[] = [{ customField: 'test', timestamp: new Date() }]

      const mockCustomDocs = customData.map((item) => ({
        data: () => item,
      }))

      const customSnapshot = {
        docs: mockCustomDocs,
        size: customData.length,
        empty: false,
      } as unknown as QuerySnapshot<CustomDocument>

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(customSnapshot)
        return jest.fn()
      })

      const customQuery = mock<Query<CustomDocument>>()

      const options: UseCollectionOptions<CustomDocument> = {
        query: customQuery,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(customData)
      expect(result.current.data[0]?.customField).toBe('test')
    })

    it('should work with DocumentData as default', async () => {
      const documentData = [{ anyField: 'value' }]

      const mockDocs = documentData.map((item) => ({
        data: () => item,
      }))

      const snapshot = {
        docs: mockDocs,
        size: documentData.length,
        empty: false,
      } as unknown as QuerySnapshot

      jest.mocked(onSnapshot).mockImplementation((query, options, successCallback) => {
        successCallback(snapshot)
        return jest.fn()
      }) as jest.Mock

      const query = mock<Query>()

      const options: UseCollectionOptions = {
        query,
      }

      const { result } = renderHook(() => useCollection(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(documentData)
    })
  })
})
