import { Err, Ok, Result } from "./types/result";

/**
 * Returns result of dividing `num` by `denom`.
 *
 * The result is an `Err` variant if `denom` is 0; otherwise, it's an `Ok` variant.
 */
export function divide(
  num: number,
  denom: number
): Result<number, DivideByZeroError> {
  if (denom === 0) {
    return new Err(new DivideByZeroError());
  }
  return new Ok(num / denom);
}

class DivideByZeroError extends Error {
  constructor() {
    super("cannot divide by 0.");
  }
}

function main() {
  let okResult = divide(20, 1);
  if (okResult.isOk()) {
    console.log(`20 / 1 is ${okResult.unwrap()}`);
  }

  let errResult = divide(20, 0);
  if (errResult.isErr()) {
    console.log(`20 / 0 returns an error: ${errResult.unwrapErr().message}`);
  }

  divide(20, -1).match(
    (num) => console.log(`20 / -1 is ${num}`),
    (err) => console.log(`20 / -1 returns an error: ${err.message}`)
  );
}

main();
