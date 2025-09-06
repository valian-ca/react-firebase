import { captureException, setUser as setSentryUser } from '@sentry/react'
import { authState } from '@valian/rxjs-firebase'
import { type initializeApp } from 'firebase/app'
import { getAuth, type User } from 'firebase/auth'
import { catchError, map, NEVER, startWith } from 'rxjs'
import { create } from 'zustand'

export interface FirebaseAuthenticatedContextValue {
  readonly initialized: true
  readonly user: User
}

export type FirebaseAuthContextValue =
  | FirebaseAuthenticatedContextValue
  | {
      readonly initialized: boolean
      readonly user: null
    }

export const useAuth = create<FirebaseAuthContextValue>(() => ({
  initialized: false,
  user: null,
}))

export const firebaseAuthSubscription = (
  app: ReturnType<typeof initializeApp>,
  onAuthStateChanged?: (state: FirebaseAuthContextValue) => void,
) =>
  authState(getAuth(app))
    .pipe(
      map((user) => ({ initialized: true, user }) as FirebaseAuthContextValue),
      catchError((error) => {
        captureException(error)
        return NEVER.pipe(startWith(useAuth.getInitialState()))
      }),
    )
    .subscribe((state) => {
      useAuth.setState(state)
      setSentryUser(
        state.user
          ? {
              id: state.user.uid,
              ...(state.user.email ? { email: state.user.email } : {}),
              ...(state.user.displayName ? { displayName: state.user.displayName } : {}),
            }
          : null,
      )
      onAuthStateChanged?.(state)
    })
