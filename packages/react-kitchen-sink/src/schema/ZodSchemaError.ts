import { type DocumentData, type QueryDocumentSnapshot } from '@firebase/firestore'

import { ErrorWithSentryCaptureContext } from '../sentry'

export class ZodSchemaError<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends ErrorWithSentryCaptureContext {
  constructor(snapshot: QueryDocumentSnapshot<AppModelType, DbModelType>, options?: ErrorOptions) {
    super(
      `Zod Error for ${snapshot.ref.path}`,
      {
        tags: { firestore: true, 'schema.zod': true, 'schema.collection': snapshot.ref.parent.id },
        fingerprint: ['schema', 'zod', snapshot.ref.parent.id],
        contexts: {
          snapshot: {
            ref: snapshot.ref,
            metadata: snapshot.metadata,
          },
        },
      },
      options,
    )
    this.name = 'ZodSchemaError'
  }
}
