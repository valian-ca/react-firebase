import { hashKey, type Query, type QueryCacheNotifyEvent, type QueryClient, type QueryKey } from '@tanstack/react-query'

export class FirestoreSnaphotManager {
  readonly #onClose = new Map<string, () => void>()

  constructor(queryClient: QueryClient) {
    const queryCache = queryClient.getQueryCache()

    queryCache.subscribe((event: QueryCacheNotifyEvent) => {
      // We only care when a query is fully removed from the cache [2]
      if (event.type === 'removed' && event.query.meta?.type === 'snapshot') {
        const query = event.query as Query
        const snapshotId = hashKey(query.queryKey)

        const closeSnapshot = this.#onClose.get(snapshotId)
        if (!closeSnapshot) {
          throw new Error(`Subscription for key ${snapshotId} not found`)
        }

        closeSnapshot()
        this.#onClose.delete(snapshotId)
      }
    })
  }

  registerSnaphot = (queryKey: QueryKey, onCloseSnaphot: () => void) => {
    const snapshotId = hashKey(queryKey)
    const closeSnapshot = this.#onClose.get(snapshotId)
    closeSnapshot?.()
    this.#onClose.set(snapshotId, onCloseSnaphot)
  }
}
