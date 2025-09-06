# @valian/react-query-observable

React Query options for RxJS observables. This package provides utilities to seamlessly integrate RxJS observables with TanStack Query (React Query), enabling reactive data fetching with automatic caching, background updates, error handling, and subscription lifecycle management.

[![npm version](https://badge.fury.io/js/@valian%2Freact-query-observable.svg)](https://badge.fury.io/js/@valian%2Freact-query-observable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
pnpm add @valian/react-query-observable
```

### Peer Dependencies

- `@tanstack/react-query` ^5.80.0
- `rxjs` ^7.8.0

## Features

- 🔄 **Reactive data fetching**: Use RxJS Observables as data sources for TanStack Query
- 🧠 **Smart caching**: First emission resolves the query; later emissions update cache
- ♻️ **Automatic subscription cleanup**: Subscriptions are tied to query lifecycle
- 🛡️ **Error handling**: Pre-first-value errors reject the query; post-first-value errors surface to the runtime
- 🧭 **Dynamic staleness**: `staleTime` is `Infinity` while subscribed, otherwise `0`
- 📦 **TypeScript first**: Strong types for options and observable function

## Quick Start

```ts
import { useQuery } from '@tanstack/react-query'
import { interval, map, take } from 'rxjs'
import { observableQueryOptions } from '@valian/react-query-observable'

function MyComponent() {
  const { data, isLoading, error } = useQuery(
    observableQueryOptions({
      queryKey: ['ticker'],
      observableFn: () => interval(1000).pipe(take(1), map((i) => ({ tick: i }))),
    }),
  )

  if (isLoading) return <div>Loading…</div>
  if (error) return <div>Error: {(error as Error).message}</div>
  return <div>Tick: {data?.tick}</div>
}
```

## API

### `observableQueryOptions`

Creates TanStack Query options from an RxJS observable function.

```ts
function observableQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: ObservableQueryOptions<TQueryFnData, TError, TData, TQueryKey>)
```

#### Parameters (selected)

- `observableFn` (required): `(ctx: QueryFunctionContext<TQueryKey>) => Observable<TQueryFnData>`
- `queryKey` (required): `TQueryKey`
- Any other standard Query Options are accepted except those managed automatically (see below).

#### Managed options

These are controlled internally and thus omitted from `ObservableQueryOptions`:

- `queryFn`: generated from `observableFn`
- `staleTime`: `Infinity` when there is an active subscription for `queryKey`, else `0`
- `retry`: `false`
- Refetch-related flags: `refetchInterval`, `refetchIntervalInBackground`, `refetchOnWindowFocus`, `refetchOnMount`, `refetchOnReconnect`, `retryOnMount`

#### Other defaults

- `gcTime`: `10_000` (can be overridden)

## Behavior Details

- The first value emitted by the observable resolves the query promise.
- Subsequent emissions update the cached data via `client.setQueryData` for the same `queryKey`.
- If the observable errors before the first value, the query promise rejects with that error.
- If the observable errors after the first value, the error is thrown in the subscription context (outside the original promise). Handle these via RxJS or global error handlers if needed.
- When the query is removed from the cache, the active subscription for the corresponding `queryKey` is automatically unsubscribed.

## Advanced Examples

### WebSocket stream

```ts
import { webSocket } from 'rxjs/webSocket'
import { map, retry } from 'rxjs/operators'

const { data } = useQuery(
  observableQueryOptions({
    queryKey: ['live-prices', symbol],
    observableFn: () =>
      webSocket<{ price: number }>(`wss://example.com/${symbol}`).pipe(
        map((msg) => msg.price),
        retry({ delay: 1000 }),
      ),
  }),
)
```

### Combine multiple sources

```ts
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

const { data } = useQuery(
  observableQueryOptions({
    queryKey: ['user-profile', userId],
    observableFn: () =>
      combineLatest([fetchUser(userId), fetchUserPosts(userId), fetchFollowers(userId)]).pipe(
        map(([user, posts, followers]) => ({ user, posts, followers })),
      ),
  }),
)
```

## TypeScript Usage

```ts
interface Todo {
  id: number
  title: string
  completed: boolean
}

const { data } = useQuery(
  observableQueryOptions<Todo[]>({
    queryKey: ['todos'],
    observableFn: () => fetchTodos$(),
  }),
)
// data: Todo[] | undefined
```

## License

MIT © [Valian](https://valian.ca)
