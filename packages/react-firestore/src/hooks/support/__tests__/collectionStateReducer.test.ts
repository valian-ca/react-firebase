import { type QuerySnapshot } from '@firebase/firestore'
import { describe, expect, it } from 'vitest'

import {
  type CollectionReducerAction,
  CollectionReducerInitialState,
  collectionStateReducer,
} from '../collectionStateReducer'

interface TestDocument {
  id: string
  name: string
}

describe('collectionStateReducer', () => {
  const reducer = collectionStateReducer<TestDocument>()

  describe('initial state', () => {
    it('should return initial state', () => {
      expect(CollectionReducerInitialState).toEqual({
        empty: true,
        size: 0,
        isLoading: true,
        isDisabled: false,
        hasError: false,
        data: [],
      })
    })
  })

  describe('actions', () => {
    it('should handle loading action', () => {
      const action: CollectionReducerAction<TestDocument> = { type: 'loading' }
      const result = reducer(CollectionReducerInitialState, action)

      expect(result).toEqual({
        empty: true,
        size: 0,
        isLoading: true,
        isDisabled: false,
        hasError: false,
        data: [],
      })
    })

    it('should handle disable action', () => {
      const action: CollectionReducerAction<TestDocument> = { type: 'disable' }
      const result = reducer(CollectionReducerInitialState, action)

      expect(result).toEqual({
        snapshot: undefined,
        size: 0,
        empty: true,
        isLoading: false,
        isDisabled: true,
        hasError: false,
        data: [],
      })
    })

    it('should handle data action', () => {
      const mockSnapshot = {
        size: 2,
        empty: false,
      } as unknown as QuerySnapshot<TestDocument>

      const testData: TestDocument[] = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ]

      const action: CollectionReducerAction<TestDocument> = {
        type: 'data',
        data: testData,
        snapshot: mockSnapshot,
      }

      const result = reducer(CollectionReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        size: 2,
        empty: false,
        isLoading: false,
        isDisabled: false,
        hasError: false,
        data: testData,
      })
    })

    it('should handle error action without snapshot', () => {
      const testError = new Error('Test error')
      const action: CollectionReducerAction<TestDocument> = {
        type: 'error',
        error: testError,
      }

      const result = reducer(CollectionReducerInitialState, action)

      expect(result).toEqual({
        snapshot: undefined,
        size: 0,
        empty: true,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: [],
      })
    })

    it('should handle error action with snapshot', () => {
      const mockSnapshot = {
        size: 1,
        empty: false,
      } as unknown as QuerySnapshot<TestDocument>

      const testError = new Error('Test error')
      const action: CollectionReducerAction<TestDocument> = {
        type: 'error',
        error: testError,
        snapshot: mockSnapshot,
      }

      const result = reducer(CollectionReducerInitialState, action)

      expect(result).toEqual({
        snapshot: mockSnapshot,
        size: 1,
        empty: false,
        isLoading: false,
        isDisabled: false,
        hasError: true,
        data: [],
      })
    })

    it('should handle unknown action by returning current state', () => {
      const unknownAction = { type: 'unknown' } as unknown as CollectionReducerAction<TestDocument>
      const initialState = CollectionReducerInitialState

      const result = reducer(initialState, unknownAction)

      expect(result).toBe(initialState)
    })
  })
})
