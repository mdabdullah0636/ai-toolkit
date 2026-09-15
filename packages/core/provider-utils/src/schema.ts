import {
  JSONSchema7,
  TypeValidationError,
  schemaSymbol,
  type Schema,
  type LazySchema,
  type ZodSchema,
  type StandardSchema,
  type FlexibleSchema,
  type InferSchema,
  type ValidationResult,
} from '@ai-toolkit/provider';
import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';
import { addAdditionalPropertiesToJsonSchema } from './add-additional-properties-to-json-schema';
import { zod3ToJsonSchema } from './to-json-schema/zod3-to-json-schema';

export {
  schemaSymbol,
  type Schema,
  type LazySchema,
  type ZodSchema,
  type StandardSchema,
  type FlexibleSchema,
  type InferSchema,
  type ValidationResult,
};

/**
 * Creates a schema with deferred creation.
 * This is important to reduce the startup time of the library
 * and to avoid initializing unused validators.
 *
 * @param createValidator A function that creates a schema.
 * @returns A function that returns a schema.
 */
export function lazySchema<SCHEMA>(createSchema: () => Schema<SCHEMA>): LazySchema<SCHEMA> {
  // cache the validator to avoid initializing it multiple times
  let schema: Schema<SCHEMA> | undefined;
  return () => {
    if (schema == null) {
      schema = createSchema();
    }
    return schema;
  };
}

/**
 * Create a schema using a JSON Schema.
 *
 * @param jsonSchema The JSON Schema for the schema.
 * @param options.validate Optional. A validation function for the schema.
 */
export function jsonSchema<OBJECT = unknown>(
  jsonSchema:
    | JSONSchema7
    | PromiseLike<JSONSchema7>
    | (() => JSONSchema7 | PromiseLike<JSONSchema7>),
  {
    validate,
  }: {
    validate?: (value: unknown) => ValidationResult<OBJECT> | PromiseLike<ValidationResult<OBJECT>>;
  } = {},
): Schema<OBJECT> {
  return {
    [schemaSymbol]: true,
    _type: undefined as OBJECT, // should never be used directly
    get jsonSchema() {
      if (typeof jsonSchema === 'function') {
        jsonSchema = jsonSchema(); // cache the function results
      }
      return jsonSchema;
    },
    validate,
  };
}

function isSchema(value: unknown): value is Schema {
  return (
    typeof value === 'object' &&
    value !== null &&
    schemaSymbol in value &&
    value[schemaSymbol] === true &&
    'jsonSchema' in value &&
    'validate' in value
  );
}

export function asSchema<OBJECT>(schema: FlexibleSchema<OBJECT> | undefined): Schema<OBJECT> {
  return schema == null
    ? jsonSchema({ properties: {}, additionalProperties: false })
    : isSchema(schema)
      ? schema
      : '~standard' in schema
        ? schema['~standard'].vendor === 'zod'
          ? zodSchema(schema as ZodSchema<OBJECT>)
          : standardSchema(schema as StandardSchema<OBJECT>)
        : schema();
}

function standardSchema<OBJECT>(standardSchema: StandardSchema<OBJECT>): Schema<OBJECT> {
  return jsonSchema(
    () =>
      addAdditionalPropertiesToJsonSchema(
        standardSchema['~standard'].jsonSchema.input({
          target: 'draft-07',
        }) as JSONSchema7,
      ),
    {
      validate: async value => {
        const result = await standardSchema['~standard'].validate(value);
        return 'value' in result
          ? { success: true, value: result.value }
          : {
              success: false,
              error: new TypeValidationError({
                value,
                cause: result.issues,
              }),
            };
      },
    },
  );
}

export function zod3Schema<OBJECT>(
  zodSchema: z3.Schema<OBJECT, z3.ZodTypeDef, any>,
  options?: {
    /**
     * Enables support for references in the schema.
     * This is required for recursive schemas, e.g. with `z.lazy`.
     * However, not all language models and providers support such references.
     * Defaults to `false`.
     */
    useReferences?: boolean;
  },
): Schema<OBJECT> {
  // default to no references (to support openapi conversion for google)
  const useReferences = options?.useReferences ?? false;

  return jsonSchema(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () =>
      zod3ToJsonSchema(zodSchema, {
        $refStrategy: useReferences ? 'root' : 'none',
      }) as JSONSchema7,
    {
      validate: async value => {
        const result = await zodSchema.safeParseAsync(value);
        return result.success
          ? { success: true, value: result.data }
          : { success: false, error: result.error };
      },
    },
  );
}

export function zod4Schema<OBJECT>(
  zodSchema: z4.core.$ZodType<OBJECT, any>,
  options?: {
    /**
     * Enables support for references in the schema.
     * This is required for recursive schemas, e.g. with `z.lazy`.
     * However, not all language models and providers support such references.
     * Defaults to `false`.
     */
    useReferences?: boolean;
  },
): Schema<OBJECT> {
  // default to no references (to support openapi conversion for google)
  const useReferences = options?.useReferences ?? false;

  return jsonSchema(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () =>
      addAdditionalPropertiesToJsonSchema(
        z4.toJSONSchema(zodSchema, {
          target: 'draft-7',
          io: 'input',
          reused: useReferences ? 'ref' : 'inline',
        }) as JSONSchema7,
      ),
    {
      validate: async value => {
        const result = await z4.safeParseAsync(zodSchema, value);
        return result.success
          ? { success: true, value: result.data }
          : { success: false, error: result.error };
      },
    },
  );
}

export function isZod4Schema(
  zodSchema: ZodSchema<any>,
): zodSchema is z4.core.$ZodType<any, any> {
  // https://zod.dev/library-authors?id=how-to-support-zod-3-and-zod-4-simultaneously
  return '_zod' in zodSchema;
}

export function zodSchema<OBJECT>(
  zodSchema: ZodSchema<OBJECT>,
  options?: {
    /**
     * Enables support for references in the schema.
     * This is required for recursive schemas, e.g. with `z.lazy`.
     * However, not all language models and providers support such references.
     * Defaults to `false`.
     */
    useReferences?: boolean;
  },
): Schema<OBJECT> {
  if (isZod4Schema(zodSchema)) {
    return zod4Schema(zodSchema as z4.core.$ZodType<OBJECT, any>, options);
  } else {
    return zod3Schema(zodSchema as z3.Schema<OBJECT, z3.ZodTypeDef, any>, options);
  }
}
