import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { anyFunction, mock } from 'jest-mock-extended'
import { Observable } from 'rxjs'

import { authState } from '../authState'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}))

type Auth = ReturnType<typeof getAuth>

describe('authState', () => {
  let mockAuth: Auth
  let mockUser: User
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUnsubscribe = jest.fn()
    mockAuth = mock<Auth>()
    mockUser = mock<User>()

    jest.mocked(getAuth).mockReturnValue(mockAuth)
    jest.mocked(onAuthStateChanged).mockReturnValue(mockUnsubscribe)
  })

  it('should create an Observable from Firebase Auth', () => {
    const observable = authState()

    expect(observable).toBeInstanceOf(Observable)
    expect(getAuth).toHaveBeenCalledTimes(1)
  })

  it('should use provided auth instance when passed', () => {
    const customAuth = mock<ReturnType<typeof getAuth>>()
    const observable = authState(customAuth)

    expect(observable).toBeInstanceOf(Observable)
    expect(getAuth).not.toHaveBeenCalled()
  })

  it('should call onAuthStateChanged with correct parameters', () => {
    const observable = authState()

    // Subscribe to trigger the onAuthStateChanged call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, anyFunction(), anyFunction(), anyFunction())
  })

  it('should emit user data when authenticated', (done) => {
    const observable = authState()

    observable.subscribe({
      next: (user) => {
        expect(user).toBe(mockUser)
        done()
      },
      error: done,
    })

    // Simulate Firebase calling the next callback
    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[1](mockUser)
  })

  it('should emit null when user is not authenticated', (done) => {
    const observable = authState()

    observable.subscribe({
      next: (user) => {
        expect(user).toBeNull()
        done()
      },
      error: done,
    })

    // Simulate Firebase calling the next callback with null
    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[1](null)
  })

  it('should emit error when Firebase reports an error', (done) => {
    const testError = new Error('Authentication error')
    const observable = authState()

    observable.subscribe({
      next: () => {},
      error: (error) => {
        expect(error).toBe(testError)
        done()
      },
    })

    // Simulate Firebase calling the error callback
    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[2](testError)
  })

  it('should complete when Firebase completes', (done) => {
    const observable = authState()

    observable.subscribe({
      complete: () => {
        expect(1).toBe(1) // Just to ensure complete is called
        done()
      },
    })

    // Simulate Firebase calling the complete callback
    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[3]()
  })

  it('should unsubscribe from Firebase when Observable is unsubscribed', () => {
    const observable = authState()
    const subscription = observable.subscribe()

    subscription.unsubscribe()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple emissions correctly', (done) => {
    const observable = authState()
    const emissions: Array<User | null> = []

    observable.subscribe({
      next: (user) => {
        emissions.push(user)
        if (emissions.length === 2) {
          expect(emissions).toHaveLength(2)
          expect(emissions[0]).toBe(mockUser)
          expect(emissions[1]).toBeNull()
          done()
        }
      },
      error: done,
    })

    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[1](mockUser)
    callbacks[1](null)
  })

  it('should handle multiple subscribers correctly', () => {
    const observable = authState()
    const subscription1 = observable.subscribe()
    const subscription2 = observable.subscribe()

    subscription1.unsubscribe()
    subscription2.unsubscribe()

    // Each subscription should call onAuthStateChanged once
    expect(onAuthStateChanged).toHaveBeenCalledTimes(2)
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2)
  })

  it('should return unsubscribe function from Observable subscription', () => {
    const observable = authState()

    const subscription = observable.subscribe()

    expect(typeof subscription.unsubscribe).toBe('function')
    subscription.unsubscribe()
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle authentication state changes', (done) => {
    const observable = authState()
    const authStates: Array<User | null> = []

    observable.subscribe({
      next: (user) => {
        authStates.push(user)
        if (authStates.length === 3) {
          expect(authStates).toHaveLength(3)
          expect(authStates[0]).toBeNull() // Initial state
          expect(authStates[1]).toBe(mockUser) // User signed in
          expect(authStates[2]).toBeNull() // User signed out
          done()
        }
      },
      error: done,
    })

    const callbacks = jest.mocked(onAuthStateChanged).mock.calls[0] as unknown as [
      Auth,
      (user: User | null) => void,
      (error: Error) => void,
      () => void,
    ]
    callbacks[1](null) // Initial state
    callbacks[1](mockUser) // User signs in
    callbacks[1](null) // User signs out
  })

  it('should work with custom auth instance', () => {
    const customAuth = mock<Auth>()
    const observable = authState(customAuth)

    // Subscribe to trigger the onAuthStateChanged call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onAuthStateChanged).toHaveBeenCalledWith(customAuth, anyFunction(), anyFunction(), anyFunction())
    expect(getAuth).not.toHaveBeenCalled()
  })
})
