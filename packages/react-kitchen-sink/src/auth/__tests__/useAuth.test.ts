import { captureException, setUser as setSentryUser } from '@sentry/react'
import { authState } from '@valian/rxjs-firebase'
import { type initializeApp } from 'firebase/app'
import { getAuth, type User } from 'firebase/auth'
import { type Observable, of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { firebaseAuthSubscription, useAuth } from '../useAuth'

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
}))

vi.mock('@valian/rxjs-firebase', () => ({
  authState: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
}))

describe('useAuth and firebaseAuthSubscription', () => {
  const app = {} as ReturnType<typeof initializeApp>

  beforeEach(() => {
    useAuth.setState(useAuth.getInitialState(), true)
    vi.clearAllMocks()
    vi.mocked(getAuth).mockReturnValue(mock<ReturnType<typeof getAuth>>())
  })

  it('has the expected initial state', () => {
    expect(useAuth.getState()).toEqual({ initialized: false, user: null })
  })

  it('handles null user emission by resetting state and clearing Sentry user', () => {
    vi.mocked(authState).mockReturnValue(of(null) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(setSentryUser).toHaveBeenCalledWith(null)
    expect(useAuth.getState()).toEqual({ initialized: true, user: null })

    sub.unsubscribe()
  })

  it('handles valid user emission by setting Sentry user and store state', () => {
    const fakeUser = {
      uid: 'uid-123',
      email: 'user@example.com',
      displayName: 'User Name',
    } as unknown as User

    vi.mocked(authState).mockReturnValue(of(fakeUser) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(setSentryUser).toHaveBeenCalledWith({
      id: fakeUser.uid,
      email: fakeUser.email ?? undefined,
      displayName: fakeUser.displayName,
    })
    expect(useAuth.getState()).toEqual({ initialized: true, user: fakeUser })

    sub.unsubscribe()
  })

  it('handles error by capturing exception and emitting null (clears Sentry user)', () => {
    const err = new Error('boom')
    vi.mocked(authState).mockReturnValue(throwError(() => err) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(captureException).toHaveBeenCalledWith(err)
    expect(setSentryUser).toHaveBeenCalledWith(null)
    expect(useAuth.getState()).toEqual({ initialized: false, user: null })

    sub.unsubscribe()
  })

  it('calls onAuthStateChanged callback when user is null', () => {
    const onAuthStateChanged = vi.fn()
    vi.mocked(authState).mockReturnValue(of(null) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app, onAuthStateChanged)

    expect(onAuthStateChanged).toHaveBeenCalledWith({ initialized: true, user: null })

    sub.unsubscribe()
  })

  it('calls onAuthStateChanged callback when user is authenticated', () => {
    const onAuthStateChanged = vi.fn()
    const fakeUser = {
      uid: 'uid-123',
      email: 'user@example.com',
      displayName: 'User Name',
    } as unknown as User

    vi.mocked(authState).mockReturnValue(of(fakeUser) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app, onAuthStateChanged)

    expect(onAuthStateChanged).toHaveBeenCalledWith({ initialized: true, user: fakeUser })

    sub.unsubscribe()
  })

  it('calls onAuthStateChanged callback when error occurs', () => {
    const onAuthStateChanged = vi.fn()
    const err = new Error('boom')
    vi.mocked(authState).mockReturnValue(throwError(() => err) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app, onAuthStateChanged)

    expect(onAuthStateChanged).toHaveBeenCalledWith({ initialized: false, user: null })

    sub.unsubscribe()
  })

  it('works without onAuthStateChanged callback (undefined)', () => {
    vi.mocked(authState).mockReturnValue(of(null) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(useAuth.getState()).toEqual({ initialized: true, user: null })
    expect(setSentryUser).toHaveBeenCalledWith(null)

    sub.unsubscribe()
  })

  it('handles user without email', () => {
    const fakeUser = {
      uid: 'uid-123',
      email: null,
      displayName: 'User Name',
    } as unknown as User

    vi.mocked(authState).mockReturnValue(of(fakeUser) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(setSentryUser).toHaveBeenCalledWith({
      id: fakeUser.uid,
      displayName: fakeUser.displayName,
    })
    expect(useAuth.getState()).toEqual({ initialized: true, user: fakeUser })

    sub.unsubscribe()
  })

  it('handles user without displayName', () => {
    const fakeUser = {
      uid: 'uid-123',
      email: 'user@example.com',
      displayName: null,
    } as unknown as User

    vi.mocked(authState).mockReturnValue(of(fakeUser) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(setSentryUser).toHaveBeenCalledWith({
      id: fakeUser.uid,
      email: fakeUser.email,
    })
    expect(useAuth.getState()).toEqual({ initialized: true, user: fakeUser })

    sub.unsubscribe()
  })

  it('handles user without email and displayName', () => {
    const fakeUser = {
      uid: 'uid-123',
      email: null,
      displayName: null,
    } as unknown as User

    vi.mocked(authState).mockReturnValue(of(fakeUser) as Observable<User | null>)

    const sub = firebaseAuthSubscription(app)

    expect(setSentryUser).toHaveBeenCalledWith({
      id: fakeUser.uid,
    })
    expect(useAuth.getState()).toEqual({ initialized: true, user: fakeUser })

    sub.unsubscribe()
  })
})
