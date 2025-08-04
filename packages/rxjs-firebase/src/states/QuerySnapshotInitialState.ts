import { type QuerySnapshotState } from './QuerySnapshotState'

export const QuerySnapshotInitialState = {
  empty: true,
  size: 0,
  isLoading: true,
  hasError: false,
  data: [],
} as const satisfies QuerySnapshotState
