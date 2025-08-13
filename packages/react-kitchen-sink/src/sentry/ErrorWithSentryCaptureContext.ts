import { type ErrorEvent, type ScopeContext } from '@sentry/core'

// eslint-disable-next-line unicorn/custom-error-definition
export class ErrorWithSentryCaptureContext extends Error {
  readonly captureContext: Partial<Pick<ScopeContext, 'extra' | 'contexts' | 'tags' | 'fingerprint'>>

  constructor(
    message: string,
    captureContext: Partial<Pick<ScopeContext, 'extra' | 'contexts' | 'tags' | 'fingerprint'>>,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.captureContext = captureContext
    // eslint-disable-next-line unicorn/custom-error-definition
    this.name = options?.cause instanceof Error ? options.cause.name : 'Error'
  }

  beforeSend = (event: ErrorEvent) => {
    if (this.captureContext.extra) {
      // eslint-disable-next-line no-param-reassign
      event.extra = {
        ...event.extra,
        ...this.captureContext.extra,
      }
    }
    if (this.captureContext.tags) {
      // eslint-disable-next-line no-param-reassign
      event.tags = {
        ...event.tags,
        ...this.captureContext.tags,
      }
    }
    if (this.captureContext.contexts) {
      // eslint-disable-next-line no-param-reassign
      event.contexts = {
        ...event.contexts,
        ...this.captureContext.contexts,
      }
    }
    if (this.captureContext.fingerprint) {
      // eslint-disable-next-line no-param-reassign
      event.fingerprint = this.captureContext.fingerprint
    }
    return event
  }
}
