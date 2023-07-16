/** Similar to Rust's `Result` type: either an `Ok` or `Err` variant. */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/** Alias for a `Result` inside a `Promise`. */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/** Alias for `T` | `undefined`. */
export type Option<T> = T | undefined;

/** Collection of methods that all variants of `Result` should implement. */
interface IResult<T, E> {
  /** Returns the inner `Ok` value or the provided default. */
  unwrapOr(t: T): T;

  /** Returns whether this `Result` is an `Ok` variant. */
  isOk(): this is Ok<T, E>;

  /** Returns the inner `Ok` value if is `Ok`; returns `undefined` otherwise. */
  ok(): Option<T>;

  /** Returns whether this `Result` is an `Err` variant. */
  isErr(): this is Err<T, E>;

  /** Returns the inner `Err` value if is `Err`; returns `undefined` otherwise. */
  err(): Option<E>;

  /**
   * Applies the supplied function to the inner value if it's an `Ok` variant;
   * leaves the `Err` value untouched otherwise.
   */
  map<U>(f: (t: T) => U): Result<U, E>;

  /**
   * Applies the supplied function to the inner error if it's an `Err` variant;
   * leaves the `Ok` value untouched otherwise.
   */
  mapErr<U>(f: (e: E) => U): Result<T, U>;

  /** Returns the provided default if `Err`, or applies the function to the inner
   * `Ok` value and returns the result of that.
   */
  mapOr<U>(def: U, f: (t: T) => U): U;

  /**
   * Calls the supplied `ok` function if it's an `Ok` variant; calls the supplied
   * `err` function otherwise.
   */
  match<U>(ok: (t: T) => U, err: (e: E) => U): U;

  /** Returns `res` if self is an `Ok`; otherwise, returns self's `Err`. */
  and<U>(res: Result<U, E>): Result<U, E>;

  /** Calls `op` if self is an `Ok`; otherwise, returns self's `Err`. */
  andThen<U>(op: (t: T) => Result<U, E>): Result<U, E>;

  /** Returns `res` if self is an `Err`; otherwise, returns self's `Ok`. */
  or<F>(res: Result<T, F>): Result<T, F>;

  /** Calls `op` if self is an `Err`; otherwise, returns self's `Ok`. */
  orElse<F>(op: (e: E) => Result<T, F>): Result<T, F>;
}

/** The `Ok` variant of `Result`. */
export class Ok<T, E> implements IResult<T, E> {
  private t: T;
  public constructor(t: T) {
    this.t = t;
  }

  /** Returns the inner `Ok` value. */
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

/** The `Err` variant of `Result`. */
export class Err<T, E> implements IResult<T, E> {
  private e: E;
  public constructor(e: E) {
    this.e = e;
  }

  /** Returns the inner error value. */
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
   * Example:
   * ```typescript
   * const someThrowingFunc = (i: number) => {
   *   if (i > 0) {
   *     return 42;
   *   }
   *   throw new Error("err");
   * };
   * let x = Result.wrap(() => someThrowingFunc(2));
   * let y = x.unwrapOr(0)); // y == 42
   * ```
   */
  export function wrap<T, E = Error>(
    f: T extends Promise<any> ? never : (...args: any[]) => T,
    e?: E,
  ): Result<T, E> {
    try {
      return new Ok(f());
    } catch (err: any) {
      return new Err(e || err);
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
   * Example:
   * ```typescript
   * const asyncThrowingFunc = async (i: number) => {
   *   if (i > 0) {
   *     return 42;
   *   }
   *   throw new Error("err");
   * };
   * let x = await Result.asyncWrap(() => asyncThrowingFunc(2));
   * let y = x.unwrapOr(0); // y == 42;
   * ```
   */
  export async function asyncWrap<T, E = Error>(
    f: (...args: any[]) => Promise<T>,
    e?: E,
  ): AsyncResult<T, E> {
    try {
      return new Ok(await f());
    } catch (err: any) {
      return new Err(e || err);
    }
  }
}
