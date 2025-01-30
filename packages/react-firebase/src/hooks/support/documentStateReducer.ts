import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'

interface DocumentLoadingState {
  snapshot?: undefined
  exists?: undefined
  isLoading: true
  isDisabled: false
  hasError: false
  data?: undefined
}

interface DocumentDisabledState {
  snapshot?: undefined
  exists?: undefined
  isLoading: false
  isDisabled: true
  hasError: false
  data?: undefined
}

interface DocumentErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: DocumentSnapshot<AppModelType, DbModelType>
  exists?: boolean
  isLoading: false
  isDisabled: false
  hasError: true
  data?: undefined
}

interface DocumentDoesNotExistState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: false
  isLoading: false
  isDisabled: false
  hasError: false
  data?: undefined
}

interface DocumentDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: true
  isLoading: false
  isDisabled: false
  hasError: false
  data: AppModelType
}

export type DocumentReducerState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | DocumentLoadingState
  | DocumentDisabledState
  | DocumentErrorState<AppModelType, DbModelType>
  | DocumentDoesNotExistState<AppModelType, DbModelType>
  | DocumentDataState<AppModelType, DbModelType>

interface DocumentDisableAction {
  type: 'disable'
}

interface DocumentErrorAction<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = unknown,
> {
  type: 'error'
  error: TError
  snapshot?: DocumentSnapshot<AppModelType, DbModelType>
}

interface DocumentDoesNotExistAction<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  type: 'doesNotExist'
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
}

interface DocumentDataAction<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  type: 'data'
  data: AppModelType
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
}

export type DocumentReducerAction<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = unknown,
> =
  | DocumentDisableAction
  | DocumentErrorAction<AppModelType, DbModelType, TError>
  | DocumentDoesNotExistAction<AppModelType, DbModelType>
  | DocumentDataAction<AppModelType, DbModelType>

export const documentStateReducer =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData, TError = unknown>() =>
  (
    state: DocumentReducerState<AppModelType, DbModelType>,
    action: DocumentReducerAction<AppModelType, DbModelType, TError>,
  ): DocumentReducerState<AppModelType, DbModelType> => {
    switch (action.type) {
      case 'error':
        return {
          snapshot: action.snapshot,
          exists: action.snapshot?.exists(),
          isLoading: false,
          isDisabled: false,
          hasError: true,
        }
      case 'doesNotExist':
        return {
          snapshot: action.snapshot,
          exists: false,
          isLoading: false,
          isDisabled: false,
          hasError: false,
        }
      case 'data':
        return {
          snapshot: action.snapshot,
          exists: true,
          isLoading: false,
          isDisabled: false,
          hasError: false,
          data: action.data,
        }
      case 'disable':
        return {
          snapshot: undefined,
          isLoading: false,
          isDisabled: true,
          hasError: false,
        }
      default:
        return state
    }
  }

export const DocumentReducerInitialState = {
  isLoading: true,
  isDisabled: false,
  hasError: false,
} as const satisfies DocumentLoadingState
