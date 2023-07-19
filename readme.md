# ts-result

An implementation of Rust's [`Result`](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)
type in Typescript.

If you're familiar with both Rust and TS, you can proceed to the [usage](#usage)
section. Otherwise, feel free to read up on the [motivating context](#motivation)
first.

## Table of contents

- [Usage](#usage)
- [Documentation](#documentation)
  - [`Ok`](#ok)
  - [`Err`](#err)
  - [Unwrapping](#unwrapping)
  - [Guards](#guards-isok-and-iserr)
  - [`map` and `mapErr`](#map-and-maperr)
  - [`mapOr`](#mapor)
  - [`match`](#match)
  - [`and` and `andThen`](#and-and-andthen)
  - [`or` and `orElse`](#or-and-orelse)
  - [`wrap` and `asyncWrap`](#wrap-and-asyncwrap)
- [Motivation](#motivation)
- [References](#references)

## Usage

You don't have to install anything! Just copy-paste the implementation from
[`types/result.ts`](./types/result.ts) onto your own codebase and then import the
definitions. That way you're free to modify/remove anything you don't need.

```typescript
import { Err, Ok, Result } from 'where/you/pasted/the/implementation.ts';
```

The code is licensed under the [MIT license](./license). No attribution is needed,
although it'd be much appreciated 😊

## Documentation

> Note: the documentation on this readme contains mostly high-level usage examples.
> For a more comprehensive lower-level doc, feel free to read the heavily-commented
> [implementation](./types/result.ts) instead (because that's the file you're using
> in your codebase anyways).

The main type `Result<T, E>` consists of two "variants": `Ok<T>` representing the
success case and `Err<E>` representing the error case.

```typescript
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    // The error case: `Err` wraps around the error value.
    return new Err(new Error('cannot divide by 0.'));
  }

  // The success case: `Ok` wraps around the success value.
  return new Ok(a / b);
}
```

The supported methods with their usage examples are available below. Most of them
have the same API as their original [Rust counterparts](https://doc.rust-lang.org/std/result/enum.Result.html#implementations).

### `Ok`

Creates the `Ok` variant of a `Result` around some value.

#### Example

```typescript
import { Ok } from './result';

const someOkResult = new Ok(42);
```

### `Err`

Creates the `Err` variant of a `Result` around some error value.

#### Example

```typescript
import { Err } from './result';

const someErrResult = new Err('kaboom');
```

### Unwrapping

Unwrapping a `Result` comes in several different forms:

- `unwrap()` on an `Ok`,
- `unwrapErr()` on an `Err`,
- `unwrapOr()` to provide a fallback value, and
- `ok()` and `err()` as more general versions of `unwrap()`

These methods are useful if you care about the inner value of a specific variant,
but can be quite cumbersome if you don't know which variant a `Result` is. In that
case, you might prefer a more convenient [method](#match) to handle both variants
simultaneously.

#### Example

```typescript
import { Err, Ok } from './result';

const someOk = new Ok(42);
someOk.unwrap(); // 42

const someErr = new Err('kaboom');
someErr.unwrapErr(); // 'kaboom'

// `unwrapOr()` returns the inner value if called on an `Ok`, otherwise it returns
// the provided default
someOk.unwrapOr(-1); // 42
someErr.unwrapOr('default'); // 'default'

// `ok()` returns the inner value if called on an `Ok`, otherwise it returns `undefined`
someOk.ok(); // 42
someErr.ok(); // undefined

// `err()` returns the inner value if called on an `Err`, otherwise it returns `undefined`
someOk.err(); // undefined
someErr.err(); // 'kaboom'
```

### Guards: `isOk` and `isErr`

You can narrow down a `Result` type into either an `Ok` or `Err` by calling guard
methods: `isOk()` and `isErr()`. These are usually followed by an unwrapping method.

#### Example

```typescript
import { Err, Ok } from './result';

const someOk = new Ok(42);
const someErr = new Err('kaboom');

someOk.isOk(); // true
someErr.isOk(); // false

someOk.isErr(); // false
someErr.isErr(); // true

if (someOk.isOk()) {
  // `unwrap` can be called here because TS knows at this point `someOk` is an `Ok`
  someOk.unwrap();
}

if (someErr.isErr()) {
  // the `Err` counterpart to `unwrap` above
  someErr.unwrapErr();
}
```

### `map` and `mapErr`

`map()` applies the supplied function to the inner value if called on an `Ok`;
returns the `Err` value otherwise. `mapErr()` does the exact opposite (only applies
the function to an `Err` inner value).

`map()` is useful for composing the results of two functions, while `mapErr()` is
used to pass through a successful result while handling an error.

#### Example

```typescript
import { Err, Ok } from './result';

const stringify = (x: number) => x.toString();

const ok = new Ok(2);
ok.map(stringify); // new Ok('2') (`stringify` gets applied)
ok.mapErr(stringify); // new Ok(2)

const err = new Err(-1);
err.map(stringify); // new Err(-1)
err.mapErr(stringify); // new Err('-1') (`stringify` gets applied)
```

### `mapOr`

Returns the provided default if called on an `Err`, otherwise applies the function
to the inner `Ok` value and returns the result of that.

#### Example

```typescript
import { Err, Ok } from './result';

const ok = new Ok('foo');
ok.mapOr(42, (v) => v.length); // 3 (since called on an `Ok`, the function is applied)

const err = new Err('bar');
err.mapOr(42, (v) => v.length); // 42 (since called on an `Err`, the default is used)
```

### `match`

Checking the variant of a `Result` before unwrapping it and repeating this for the
error case again and again can be cumbersome. `match()` allows you to "access" the
inner values of both cases simultaneously via callbacks and will call the right one
for you (depending on the actual variant of the `Result`).

#### Example

```typescript
import { fetchAllIds } from '../api';
import { Err, Ok } from './result';

const fetchResult: Result<string[], Error> = await fetchAllIds();

// By matching on the result, we provide callbacks for both cases at the same time,
// and depending on which variant the result actually is, the right callback will
// be fired.
fetchResult.match(
  (ids) => {
    // Do something with the unwrapped `ids` when the result is an `Ok`...
  },
  (err) => {
    // Do something with the unwrapped `err` when the result is an `Err`...
  },
);
```

### `and` and `andThen`

These can be thought of as being somewhat analogous to the `&&` operator but for
`Result`s, where an `Ok` is kinda like a `true` and an `Err` a `false`. This is
the opposite of [`or()`](#or-and-orelse).

`and()` returns the provided result on an `Ok`; returns its own `Err` otherwise.
`andThen()` calls the provided callback on an `Ok`; returns its own `Err` otherwise.

#### Example

```typescript
import { Err, Ok } from './result';

const ok1 = new Ok(2);
const ok2 = new Ok(100);
const err1 = new Err('err');
const err2 = new Err('ror');

ok1.and(err1); // new Err('err'), because it's kinda like a `true && false`
ok1.and(ok2); // new Ok(100), kinda like a `true && true`
err1.and(err2); // new Err('err'), kinda like a `false && false`

const square = (x: number) => new Ok(x * x);
ok1.andThen(square); // new Ok(4) (`square` gets called)
err1.andThen(square); // new Err('err')
```

### `or` and `orElse`

These can be thought of as being somewhat analogous to the `||` operator but for
`Result`s, where an `Ok` is kinda like a `true` and an `Err` a `false`. This is
the opposite of [`and()`](#and-and-andthen).

`or()` returns the provided result on an `Err`; returns its own `Ok` otherwise.
`orElse()` calls the provided callback on an `Err`; returns its own `Ok` otherwise.

#### Example

```typescript
import { Err, Ok } from './result';

const ok1 = new Ok(2);
const ok2 = new Ok(100);
const err1 = new Err('err');
const err2 = new Err('ror');

ok1.or(err1); // new Ok(2), because it's kinda like a `true || false`
err1.or(ok1); // new Ok(2), kinda like a `false || true`
err1.or(err2); // new Err('ror'), kinda like a `false || false`

const square = (x: number) => new Ok(x * x);
ok1.orElse(square); // new Ok(2)
new Err(4).orElse(square); // new Ok(16) (`square` gets called)
```

### `wrap` and `asyncWrap`

Not all functions can be defined to return `Result`s, e.g. those imported from 3rd
party libs. Those ones will most likely throw, and we need a way to integrate them
into our non-throwing codebase. We can `wrap()` them!

`wrap()` takes a throwing function, calls it, and returns a `Result` around its
return value and throwable error. `asyncWrap()` does the same, but for async functions.
Unlike the other methods though, these two are called like static methods
(`Result.wrap()`) instead of on some `Result` instance.

#### Example

```typescript
import { throwingFunc } from 'some-external-pkg';
import { Result } from './result';

// `result1` is the result of calling `throwingFunc` wrapped inside a `Result`.
const result1 = Result.wrap(throwingFunc);

function someOtherThrowing(input: number) {
  if (input < 0) {
    throw new Error('invalid input');
  }
  return input;
}

// We can optionally pass a custom error to wrap inside the `Result` to replace
// the function's default throwable error. Here `result2` is a
// `new Err(new Error('a custom error'))`.
const result2 = Result.wrap(
  () => someOtherThrowing(-1),
  new Error('a custom error'),
);

// Async functions are supported too with `asyncWrap()` below
async function asyncThrowing(input: number) {
  await new Promise((r) => setTimeout(r, 1000));
  if (input < 0) {
    throw new Error('err');
  }
  return 42;
}

// `asyncResult` is a Promise-wrapped `Result`
const asyncResult = Result.asyncWrap(async () => asyncThrowing(1));
const innerResult = await asyncResult; // new Ok(42)

// This one uses a custom error
Result.asyncWrap(async () => asyncThrowing(-1), new Error('custom err'));
```

---

---

## Motivation

Take a look at the signature of this example TS function.

```typescript
/** Returns some number calculated according to some equation. */
function calculate(alpha: number, beta: number): number {}
```

It looks simple enough that we can just call it as part of normal control flow.
Looks are deceiving, however, because it actually throws, so you need to remember
to wrap it in a `try-catch` block.

```typescript
function calculate(alpha: number, beta: number): number {
  // ...

  if (alpha > beta) {
    throw new InvalidBetaError();
  }
}
```

Unlike in [Java](https://docs.oracle.com/javase/tutorial/essential/exceptions/declaring.html)
or [Swift](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/#Propagating-Errors-Using-Throwing-Functions)
where throwing functions are visibly marked, the only way to signal that a TS function
throws is by stating so in its documentation. TS also doesn't check for uncaught
errors until runtime, making it too easy to forget to handle thrown errors, especially
if the throwing function is written by someone else.

Now contrast that with Rust and how it expresses the same error:

```rust
fn calculate(alpha: u32, beta: u32) -> Result<u32, InvalidBetaError> {
  // ...

  if (alpha > beta) {
    // Instead of being thrown, the error is now returned!
    return Err(errors::InvalidBetaError);
  }
}
```

The return type being a `Result` gives us two benefits: 1. the error is visible even
from just the function signature, and 2. more importantly, the error is encoded
(wrapped) in the return type. The caller of `calculate` can't use the return value
without "unwrapping" the `Result` first, in the process reminding them to either
handle the error case or **consciously** decide to propagate/ignore it (no more
forgetting to handle errors because they are now encoded into the type system).

This repo is an attempt to bring those benefits over to TS!

## References

Other repos that offer similar porting of `Result` to TS:

- https://github.com/supermacro/neverthrow
- https://github.com/hazae41/result
