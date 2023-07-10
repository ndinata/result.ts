/** Similar to Rust's `Result` type: either an `Ok` or `Err` variant. */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/** Collection of methods that all variants of `Result` should implement. */
interface IResult<T, E> {
  /** Returns the inner `Ok` value or the provided default. */
  unwrapOr(t: T): T;

  /** Returns whether this `Result` is an `Ok` variant. */
  isOk(): this is Ok<T, E>;

  /** Returns whether this `Result` is an `Err` variant. */
  isErr(): this is Err<T, E>;

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

  /** Returns `res` if self is an `Err`; otherwise, returns self's `Ok` value. */
  or<F>(res: Result<T, F>): Result<T, F>;
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

  isErr(): this is Err<T, E> {
    return false;
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

  or<F>(_: Result<T, F>): Result<T, F> {
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

  isErr(): this is Err<T, E> {
    return true;
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

  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }
}
