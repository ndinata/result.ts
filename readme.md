# Results

An implementation of Rust's [`Result`](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) type in Typescript.

## Table of contents

- [Motivation](#motivation)
- [Usage](#usage)

## Motivation

If you're familiar with both Rust and TS, you already know what's up 👍 Feel free to skip to the [usage](#usage) section.

Otherwise, here's some motivating context. First, take a look at the signature of this example TS function.

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

## Usage

TODO
