import { type DocumentSnapshot } from '@firebase/firestore'
import { describe, expect, it } from 'vitest'

import { type DocumentReducerAction, DocumentReducerInitialState, documentStateReducer } from '../documentStateReducer'

interface TestDocument {
  id: string
  name: string
}

describe('documentStateReducer', () => {
  const reducer = documentStateReducer<TestDocument>()

  describe('initial state', () => {
    it('should return initial state', () => {
      expect(DocumentReducerInitialState).toEqual({
        isLoading: true,
        isDisabled: false,
        hasError: false,
      })
    })
  })

  describe('actions', () => {
    it('should handle loading action', () => {
      const action: DocumentReducerAction<TestDocument> = { type: 'loading' }
      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: undefined,
        isLoading: true,
        isDisabled: false,
        hasError: false,
      })
    })

    it('should handle disable action', () => {
      const action: DocumentReducerAction<TestDocument> = { type: 'disable' }
      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: undefined,
        isLoading: false,
        isDisabled: true,
        hasError: false,
      })
    })

    it('should handle data action', () => {
      const mockSnapshot = {} as unknown as DocumentSnapshot<TestDocument>
      const testData: TestDocument = { id: '1', name: 'Test Document' }

      const action: DocumentReducerAction<TestDocument> = {
        type: 'data',
        data: testData,
        snapshot: mockSnapshot,
      }

      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        exists: true,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: testData,
      })
    })

    it('should handle doesNotExist action', () => {
      const mockSnapshot = {} as unknown as DocumentSnapshot<TestDocument>

      const action: DocumentReducerAction<TestDocument> = {
        type: 'doesNotExist',
        snapshot: mockSnapshot,
      }

      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        exists: false,
        isLoading: false,
        isDisabled: false,
        hasError: false,
      })
    })

    it('should handle error action without snapshot', () => {
      const testError = new Error('Test error')
      const action: DocumentReducerAction<TestDocument> = {
        type: 'error',
        error: testError,
      }

      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: undefined,
        exists: undefined,
        isLoading: false,
        isDisabled: false,
        hasError: true,
      })
    })

    it('should handle error action with snapshot', () => {
      const mockSnapshot = {
        exists: () => false,
      } as unknown as DocumentSnapshot<TestDocument>

      const testError = new Error('Test error')
      const action: DocumentReducerAction<TestDocument> = {
        type: 'error',
        error: testError,
        snapshot: mockSnapshot,
      }

      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        exists: false,
        isLoading: false,
        isDisabled: false,
        hasError: true,
      })
    })

    it('should handle error action with snapshot that exists', () => {
      const mockSnapshot = {
        exists: () => true,
      } as unknown as DocumentSnapshot<TestDocument>

      const testError = new Error('Test error')
      const action: DocumentReducerAction<TestDocument> = {
        type: 'error',
        error: testError,
        snapshot: mockSnapshot,
      }

      const result = reducer(DocumentReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        exists: true,
        isLoading: false,
        isDisabled: false,
        hasError: true,
      })
    })

    it('should handle unknown action by returning current state', () => {
      const unknownAction = { type: 'unknown' } as unknown as DocumentReducerAction<TestDocument>
      const initialState = DocumentReducerInitialState

      const result = reducer(initialState, unknownAction)

      expect(result).toBe(initialState)
    })
  })
})
