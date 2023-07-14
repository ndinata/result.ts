# Results

An implementation of Rust's [`Result`](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) type in Typescript.

If you're familiar with both Rust and TS, you already know what's up 👍 Feel free to proceed to the [usage](#usage) section. Otherwise,
you might want to check out the [motivation](#motivation) behind this first.

## Table of contents

- [Usage](#usage)
- [Motivation](#motivation)
- [References](#references)

## Usage

TODO

<details>
<summary>Implementation of the <code>Result</code> type.</summary>

```typescript
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
```

</details>

## Motivation

Take a look at the signature of this example TS function.

```typescript
/** Returns some number calculated according to some equation. */
function calculate(alpha: number, beta: number): number {}
```

It looks simple enough that we can just... call it as part of normal control flow. Right?

Well not quite, because that function actually throws, so it probably needs to be wrapped in a `try-catch` block.

```typescript
function calculate(alpha: number, beta: number): number {
  // ...

  if (alpha > beta) {
    throw new InvalidBetaError();
  }
}
```

Unlike say [Java](https://docs.oracle.com/javase/tutorial/essential/exceptions/declaring.html) or [Swift](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/#Propagating-Errors-Using-Throwing-Functions), Typescript provides no facilities to mark that a function can throw.
The only way to provide a visible indicator is by including that info in the function's documentation, which the
language wouldn't remind you to do if you forgot to. Heck, TS doesn't even check for uncaught errors until runtime.
You can call `calculate` without catching and your program will compile and run... until the time comes when it _does_
throw, at which point the program will crash.

In short, error handling in TS pretty much boils down to relying on the human programmer to:

1. first know which functions can throw (by reading their docs which may be missing/incomplete), and then
2. remember to properly catch those thrown errors

Now contrast that with Rust and how it expresses errors:

```rust
fn calculate(alpha: u32, beta: u32) -> Result<u32, InvalidBetaError> {
  // ...

  if (alpha > beta) {
    return Err(errors::InvalidBetaError);
  }
}
```

Instead of being thrown, the error is returned, giving the function a return type of `Result`. This gives us two benefits:

<table>
    <tr>
        <th></th>
        <th align="left" width="25%">Before (throw error)</th>
        <th align="left">After (return error)</th>
    </tr>
    <tr>
        <td><b>Error visibility</b></td>
        <td>Reliant on being documented</td>
        <td>Visible even from function signature</td>
    </tr>
    <tr>
        <td><b>Error handling</b></td>
        <td>Bypassable: uncaught errors are not checked until runtime</td>
        <td>Unmissable: the return type is no longer a simple <code>number</code>, so the caller has to "unwrap" the return value before they can use it (a type error otherwise), prompting the programmer to either handle the error case or <b>purposefully</b> ignore/propagate it</td>
    </tr>
</table>
