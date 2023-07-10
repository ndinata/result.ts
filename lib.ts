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
