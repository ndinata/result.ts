import { divide } from "./lib";

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
