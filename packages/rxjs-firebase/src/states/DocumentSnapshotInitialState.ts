import { type DocumentSnapshotState } from './DocumentSnapshotState'

export const DocumentSnapshotInitialState = {
  isLoading: true,
  hasError: false,
} as const satisfies DocumentSnapshotState
