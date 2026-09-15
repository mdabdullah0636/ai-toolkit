import { JSONSchema7 } from 'json-schema';
import type { StandardSchemaV1, StandardJSONSchemaV1 } from '@standard-schema/spec';

export type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

const schemaSymbol = Symbol.for('vercel.ai.schema');

export type SchemaSymbol = typeof schemaSymbol;

export { schemaSymbol };

export type ValidationResult<OBJECT> =
  | { success: true; value: OBJECT }
  | { success: false; error: Error };

export type Schema<OBJECT = unknown> = {
  [schemaSymbol]: true;
  _type: OBJECT;
  readonly validate?: (
    value: unknown,
  ) => ValidationResult<OBJECT> | PromiseLike<ValidationResult<OBJECT>>;
  readonly jsonSchema: JSONSchema7 | PromiseLike<JSONSchema7>;
};

export type LazySchema<SCHEMA> = () => Schema<SCHEMA>;

export type ZodSchema<SCHEMA = any> = StandardSchemaV1<unknown, SCHEMA>;

export type StandardSchema<SCHEMA = any> = StandardSchemaV1<unknown, SCHEMA> &
  StandardJSONSchemaV1<unknown, SCHEMA>;

export type FlexibleSchema<SCHEMA = any> =
  | Schema<SCHEMA>
  | LazySchema<SCHEMA>
  | ZodSchema<SCHEMA>
  | StandardSchema<SCHEMA>;

export type InferSchema<SCHEMA> = SCHEMA extends ZodSchema<infer T>
  ? T
  : SCHEMA extends StandardSchema<infer T>
    ? T
    : SCHEMA extends LazySchema<infer T>
      ? T
      : SCHEMA extends Schema<infer T>
        ? T
        : never;
