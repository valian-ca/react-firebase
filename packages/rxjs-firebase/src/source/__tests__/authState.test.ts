import { getAuth, onAuthStateChanged, type Unsubscribe, type User } from 'firebase/auth'
import { Observable } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { anyFunction, mock } from 'vitest-mock-extended'

import { authState } from '../authState'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

type Auth = ReturnType<typeof getAuth>

describe('authState', () => {
  let mockAuth: Auth
  let mockUser: User
  let mockUnsubscribe: ReturnType<typeof vi.fn<Unsubscribe>>

  beforeEach(() => {
    vi.clearAllMocks()

    mockUnsubscribe = vi.fn()
    mockAuth = mock<Auth>()
    mockUser = mock<User>()

    vi.mocked(getAuth).mockReturnValue(mockAuth)
    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsubscribe)
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

  it('should emit user data when authenticated', async () => {
    const observable = authState()

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (user) => {
          expect(user).toBe(mockUser)
          subscription.unsubscribe()
          resolve()
        },
        error: reject,
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[1](mockUser)
    })
  })

  it('should emit null when user is not authenticated', async () => {
    const observable = authState()

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (user) => {
          expect(user).toBeNull()
          subscription.unsubscribe()
          resolve()
        },
        error: reject,
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[1](null)
    })
  })

  it('should emit error when Firebase reports an error', async () => {
    const testError = new Error('Authentication error')
    const observable = authState()

    await new Promise<void>((resolve) => {
      const subscription = observable.subscribe({
        error: (error) => {
          expect(error).toBe(testError)
          subscription.unsubscribe()
          resolve()
        },
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[2](testError)
    })
  })

  it('should complete when Firebase completes', async () => {
    const observable = authState()

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        complete: () => {
          expect(1).toBe(1)
          subscription.unsubscribe()
          resolve()
        },
        error: reject,
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[3]()
    })
  })

  it('should unsubscribe from Firebase when Observable is unsubscribed', () => {
    const observable = authState()
    const subscription = observable.subscribe()

    subscription.unsubscribe()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple emissions correctly', async () => {
    const observable = authState()
    const emissions: Array<User | null> = []

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (user) => {
          emissions.push(user)
          if (emissions.length === 2) {
            expect(emissions).toHaveLength(2)
            expect(emissions[0]).toBe(mockUser)
            expect(emissions[1]).toBeNull()
            subscription.unsubscribe()
            resolve()
          }
        },
        error: reject,
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[1](mockUser)
      callbacks[1](null)
    })
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

  it('should handle authentication state changes', async () => {
    const observable = authState()
    const authStates: Array<User | null> = []

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (user) => {
          authStates.push(user)
          if (authStates.length === 3) {
            expect(authStates).toHaveLength(3)
            expect(authStates[0]).toBeNull()
            expect(authStates[1]).toBe(mockUser)
            expect(authStates[2]).toBeNull()
            subscription.unsubscribe()
            resolve()
          }
        },
        error: reject,
      })

      const callbacks = vi.mocked(onAuthStateChanged).mock.calls.at(-1)! as unknown as [
        Auth,
        (user: User | null) => void,
        (error: Error) => void,
        () => void,
      ]
      callbacks[1](null)
      callbacks[1](mockUser)
      callbacks[1](null)
    })
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
