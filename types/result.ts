/**
 * Similar to Rust's `Result` type: either an `Ok` or `Err` variant.
 *
 * Used for annotating the types of variables and function return values.
 *
 * If you encounter a type error about some `unknown` type when using any of the
 * `ResultInterface` methods, explicitly annotating the value with the correct
 * `Result` type should fix it.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * Alias for a Promise-wrapped `Result`.
 *
 * To use the inner `Result`, you can `await` or `.then` it like any other Promise.
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/** Alias for `T` | `undefined`. */
export type Option<T> = T | undefined;

/**
 * Interface defining the methods that a `Result` variant should implement.
 */
interface ResultI<T, E> {
  /**
   * Returns the inner value if called on an `Ok`, otherwise returns `t`.
   *
   * ## Example
   * ```
   * new Ok(2).unwrapOr(0); // 2
   * new Err(-1).unwrapOr(0); // 0
   * ```
   */
  unwrapOr(t: T): T;

  /**
   * Returns whether this `Result` is an `Ok` variant.
   *
   * ## Example
   * ```
   * new Ok(2).isOk(); // true
   * new Err(-1).isOk(); // false
   * ```
   */
  isOk(): this is Ok<T, E>;

  /**
   * Returns the inner value if called on an `Ok`, otherwise returns `undefined`.
   *
   * ## Example
   * ```
   * new Ok(2).ok(); // 2
   * new Err(-1).ok(); // undefined
   * ```
   */
  ok(): Option<T>;

  /**
   * Returns whether this `Result` is an `Err` variant.
   *
   * ## Example
   * ```
   * new Ok(2).isErr(); // false
   * new Err(-1).isErr(); // true
   * ```
   */
  isErr(): this is Err<T, E>;

  /**
   * Returns the inner value if called on an `Err`, otherwise returns `undefined`.
   *
   * ## Example
   * ```
   * new Ok(2).err(); // undefined
   * new Err(-1).err(); // -1
   * ```
   */
  err(): Option<E>;

  /**
   * Applies `f` to the inner value if called on an `Ok`, otherwise returns the
   * `Err` value untouched.
   *
   * ## Example
   * ```
   * const stringify = (x: number) => x.toString();
   * new Ok(2).map(stringify); // new Ok("2")
   * new Err(-1).map(stringify); // new Err(-1)
   * ```
   */
  map<U>(f: (t: T) => U): Result<U, E>;

  /**
   * Applies `f` to the inner value if called on an `Err`, otherwise returns the
   * `Ok` value untouched.
   *
   * ## Example
   * ```
   * const stringify = (x: number) => x.toString();
   * new Ok(2).mapErr(stringify); // new Ok(2)
   * new Err(-1).mapErr(stringify); // new Err("-1")
   * ```
   */
  mapErr<U>(f: (e: E) => U): Result<T, U>;

  /**
   * Returns `def` if called on an `Err`, otherwise applies the function `f` to
   * the inner `Ok` value.
   *
   * ## Example
   * ```
   * new Ok("foo").mapOr(42, (v) => v.length); // 3
   * new Err("bar").mapOr(42, (v) => v.length); // 42
   * ```
   */
  mapOr<U>(def: U, f: (t: T) => U): U;

  /**
   * Applies `ok` to the inner value if called on an `Ok`, otherwise applies `err`.
   *
   * The provided functions don't have to return anything (can return `void`).
   *
   * ## Example
   * ```
   * const ok = (x: number) => x;
   * const err = (_: number) => 0;
   *
   * new Ok(2).match(ok, err); // 2
   * new Err(-1).match(ok, err); // 0
   *
   * new Ok(2).match(
   *   (v) => console.log(`value is ${v}`),
   *   (error) => console.log(`error is ${error}`)
   * );
   * ```
   */
  match<U>(ok: (t: T) => U, err: (e: E) => U): U;

  /**
   * Returns `res` if called on an `Ok`, otherwise returns self.
   *
   * ## Example
   * ```
   * new Err(-1).and(new Err(-100)); // new Err(-1)
   * new Err(-1).and(new Ok(2)); // new Err(-1)
   * new Ok(2).and(new Err(-1)); // new Err(-1)
   * new Ok(2).and(new Ok(100)); // new Ok(100)
   * ```
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Applies `op` and returns its result if called on an `Ok`, otherwise returns self.
   *
   * This function can be used for control flow based on `Result` values.
   *
   * ## Example
   * ```
   * const square = (x: number) => new Ok(x * x);
   * new Ok(2).andThen(square); // new Ok(4)
   * new Err(-1).andThen(square); // new Err(-1)
   * ```
   */
  andThen<U>(op: (t: T) => Result<U, E>): Result<U, E>;

  /**
   * Returns `res` if called on an `Err`, otherwise returns self.
   *
   * ## Example
   * ```
   * new Err(-1).or(new Err(-100)); // new Err(-100)
   * new Err(-1).or(new Ok(2)); // new Ok(2)
   * new Ok(2).or(new Err(-1)); // new Ok(2)
   * new Ok(2).or(new Ok(100)); // new Ok(2)
   * ```
   */
  or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * Applies `op` and returns its result if called on an `Err`, otherwise returns self.
   *
   * This function can be used for control flow based on `Result` values.
   *
   * ## Example
   * ```
   * const square = (x: number) => new Ok(x * x);
   * new Ok(2).orElse(square); // new Ok(2)
   * new Err(-2).orElse(square); // new Ok(4)
   * ```
   */
  orElse<F>(op: (e: E) => Result<T, F>): Result<T, F>;
}

/**
 * The `Ok` variant of `Result`.
 *
 * ## Example
 * ```
 * // Inferred to be of type `Ok<number, unknown>`
 * const someOk = new Ok(2);
 *
 * // Explicit type for clarity
 * const x: Result<number, Error> = new Ok(1);
 *
 * // Alternative style of explicit typing
 * new Ok<number, Error>(1);
 * ```
 */
export class Ok<T, E> implements ResultI<T, E> {
  public constructor(private readonly t: T) {}

  /**
   * Returns the inner success value.
   *
   * ## Example
   * ```
   * const x = new Ok(2);
   * x.unwrap(); // 2
   * ```
   */
  unwrap(): T {
    return this.t;
  }

  unwrapOr(_: T): T {
    return this.t;
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  ok(): Option<T> {
    return this.t;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  err(): Option<E> {
    return undefined;
  }

  map<U>(f: (t: T) => U): Result<U, E> {
    return new Ok(f(this.t));
  }

  mapErr<U>(_: (e: E) => U): Result<T, U> {
    return new Ok(this.t);
  }

  mapOr<U>(_: U, f: (t: T) => U): U {
    return f(this.t);
  }

  match<U>(ok: (t: T) => U, _: (e: E) => U): U {
    return ok(this.t);
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U>(op: (t: T) => Result<U, E>): Result<U, E> {
    return op(this.t);
  }

  or<F>(_: Result<T, F>): Result<T, F> {
    return new Ok(this.t);
  }

  orElse<F>(_: (e: E) => Result<T, F>): Result<T, F> {
    return new Ok(this.t);
  }
}

/**
 * The `Err` variant of `Result`.
 *
 * ## Example
 * ```
 * // Inferred to be of type `Err<unknown, string>`
 * const someErr = new Err("kaboom");
 *
 * // Explicit type for clarity
 * const x: Result<number, string> = new Err("kaboom");
 *
 * // Alternative style of explicit typing
 * new Err<number, string>("kaboom");
 * ```
 */
export class Err<T, E> implements ResultI<T, E> {
  public constructor(private readonly e: E) {}

  /**
   * Returns the inner error value.
   *
   * ## Example
   * ```
   * const x = new Err("kaboom");
   * x.unwrapErr(); // "kaboom"
   * ```
   */
  unwrapErr(): E {
    return this.e;
  }

  unwrapOr(t: T): T {
    return t;
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  ok(): Option<T> {
    return undefined;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  err(): Option<E> {
    return this.e;
  }

  map<U>(_: (t: T) => U): Result<U, E> {
    return new Err(this.e);
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return new Err(f(this.e));
  }

  mapOr<U>(def: U, _: (t: T) => U): U {
    return def;
  }

  match<U>(_: (t: T) => U, err: (e: E) => U): U {
    return err(this.e);
  }

  and<U>(_: Result<U, E>): Result<U, E> {
    return new Err(this.e);
  }

  andThen<U>(_: (t: T) => Result<U, E>): Result<U, E> {
    return new Err(this.e);
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  orElse<F>(op: (e: E) => Result<T, F>): Result<T, F> {
    return op(this.e);
  }
}

export namespace Result {
  // Wrapping a throwing function (e.g. from a 3rd party lib) into returning a
  // `Result` is a great idea which I encountered in another similar repo:
  // https://github.com/supermacro/neverthrow/
  // The concept for `wrap()` and `asyncWrap()` below is inspired by that repo's
  // `fromThrowable()`, although the usage semantics ultimately differ.

  /**
   * Wraps a throwing function `f` in a `Result`.
   *
   * If `f` throws when called, returns an `Err` containing the thrown error (or
   * `e` if provided). Otherwise, returns an `Ok` containing the return value of `f`.
   *
   * NOTE: `f` cannot be async (returns a Promise). For that, use `asyncWrap()` instead.
   *
   * ## Example
   * ```
   * const someThrowingFunc = (i: number) => {
   *   if (i < 0) {
   *     throw new Error("err");
   *   }
   *   return 42;
   * };
   * Result.wrap(() => someThrowingFunc(2)).ok(); // 42
   * Result.wrap(() => someThrowingFunc(-1)).err(); // new Error("err")
   * ```
   */
  export function wrap<T, E = Error>(
    f: T extends Promise<any> ? never : (...args: any[]) => T,
    e?: E,
  ): Result<T, E> {
    try {
      return new Ok(f());
    } catch (err: any) {
      return new Err(e ?? err);
    }
  }

  /**
   * Wraps a throwing async function `f` in an `AsyncResult`.
   *
   * If `f` throws when called, returns a Promise-wrapped `Err` containing the
   * thrown error (or `e` if provided). Otherwise, returns a Promise-wrapped `Ok`
   * containing the return value of `f`.
   *
   * NOTE: `f` has to be async (returns a Promise). For sync functions, use
   * `wrap()` instead.
   *
   * ## Example
   * ```
   * const asyncThrowing = async (i: number) => {
   *   if (i < 0) {
   *     throw new Error("err");
   *   }
   *   return 42;
   * };
   * (await Result.asyncWrap(async () => asyncThrowing(2))).ok(); // 42
   * (await Result.asyncWrap(async () => asyncThrowing(-1))).err(); // new Error("err")
   * ```
   */
  export async function asyncWrap<T, E = Error>(
    f: (...args: any[]) => Promise<T>,
    e?: E,
  ): AsyncResult<T, E> {
    try {
      return new Ok(await f());
    } catch (err: any) {
      return new Err(e ?? err);
    }
  }
}
