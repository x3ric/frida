/**
 * It serializes passed object into string
 * The numeric values must be finite.
 * Any other input values will be coerced to empty strings.
 *
 * @param obj The object to serialize into a URL query string
 * @param sep The substring used to delimit key and value pairs in the query string
 * @param eq The substring used to delimit keys and values in the query string
 * @param name
 */
export type EncodeFuncType = (
  obj?: Record<any, unknown>,
  sep?: string,
  eq?: string,
  name?: any
) => string;

/**
 * parses a URL query string into a collection of key and value pairs
 *
 * @param qs The URL query string to parse
 * @param sep The substring used to delimit key and value pairs in the query string
 * @param eq The substring used to delimit keys and values in the query string
 * @param options.decodeURIComponent The function to use when decoding percent-encoded characters in the query string
 * @param options.maxKeys Specifies the maximum number of keys to parse. Specify 0 to remove key counting limitations default 1000
 */
export type DecodeFuncType = (
  qs?: string,
  sep?: string,
  eq?: string,
  options?: {
    decodeURIComponent?: Function;
    maxKeys?: number;
  }
) => Record<any, unknown>;

export const encode: EncodeFuncType;
export const stringify: EncodeFuncType;

export const decode: DecodeFuncType;
export const parse: DecodeFuncType;
