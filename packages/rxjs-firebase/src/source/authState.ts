import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { Observable } from 'rxjs'

/**
 * Create an observable of authentication state. The observer is only
 * triggered on sign-in or sign-out.
 * @param auth firebase.auth.Auth
 */
export function authState(auth = getAuth()): Observable<User | null> {
  return new Observable((subscriber) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      subscriber.next.bind(subscriber),
      subscriber.error.bind(subscriber),
      subscriber.complete.bind(subscriber),
    )
    return { unsubscribe }
  })
}
