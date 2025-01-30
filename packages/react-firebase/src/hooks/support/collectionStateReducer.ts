import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'

interface CollectionLoadingState {
  snapshot?: undefined
  empty: true
  size: 0
  isLoading: true
  isDisabled: false
  hasError: false
  data: []
}

interface CollectionDisabledState {
  snapshot?: undefined
  empty: true
  size: 0
  isLoading: false
  isDisabled: true
  hasError: false
  data: []
}

interface CollectionErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  isDisabled: false
  hasError: true
  data: []
}

interface CollectionDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  isDisabled: false
  hasError: false
  data: AppModelType[]
}

export type CollectionReducerState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | CollectionLoadingState
  | CollectionDisabledState
  | CollectionErrorState<AppModelType, DbModelType>
  | CollectionDataState<AppModelType, DbModelType>

interface CollectionDisableAction {
  type: 'disable'
}
interface CollectionErrorAction<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = unknown,
> {
  type: 'error'
  error: TError
  snapshot?: QuerySnapshot<AppModelType, DbModelType>
}
interface CollectionDataAction<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  type: 'data'
  data: AppModelType[]
  snapshot: QuerySnapshot<AppModelType, DbModelType>
}

export type CollectionReducerAction<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = unknown,
> =
  | CollectionDisableAction
  | CollectionErrorAction<AppModelType, DbModelType, TError>
  | CollectionDataAction<AppModelType, DbModelType>

export const collectionStateReducer =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData, TError = unknown>() =>
  (
    state: CollectionReducerState<AppModelType, DbModelType>,
    action: CollectionReducerAction<AppModelType, DbModelType, TError>,
  ): CollectionReducerState<AppModelType, DbModelType> => {
    switch (action.type) {
      case 'error':
        return {
          snapshot: action.snapshot,
          size: action.snapshot?.size ?? 0,
          empty: action.snapshot?.empty ?? true,
          isLoading: false,
          isDisabled: false,
          hasError: true,
          data: [],
        }
      case 'data':
        return {
          snapshot: action.snapshot,
          size: action.snapshot.size,
          empty: action.snapshot.empty,
          isLoading: false,
          isDisabled: false,
          hasError: false,
          data: action.data,
        }
      case 'disable':
        return {
          snapshot: undefined,
          size: 0,
          empty: true,
          isLoading: false,
          isDisabled: true,
          hasError: false,
          data: [],
        }
      default:
        return state
    }
  }

export const CollectionReducerInitialState = {
  empty: true,
  size: 0,
  isLoading: true,
  isDisabled: false,
  hasError: false,
  data: [],
} as const satisfies CollectionLoadingState
