import { Err, Ok, Result } from "./result";

test("`unwrap` works", () => {
  let x = new Ok(4);
  expect(x.unwrap()).toBe(4);

  let y = new Err("error");
  expect(y.unwrapErr()).toBe("error");
});

test("`unwrapOr` works", () => {
  let fallback = 2;

  let x = new Ok(4);
  expect(x.unwrapOr(fallback)).toBe(4);

  let y = new Err("error");
  expect(y.unwrapOr(fallback)).toBe(fallback);
});

test("`isOk` works", () => {
  let x = new Ok(-3);
  expect(x.isOk()).toBeTruthy();

  let y = new Err("error");
  expect(y.isOk()).toBeFalsy();
});

test("`isErr` works", () => {
  let x = new Ok(-3);
  expect(x.isErr()).toBeFalsy();

  let y = new Err("error");
  expect(y.isErr()).toBeTruthy();
});

test("`map` works", () => {
  const stringify = (x: number) => x.toString();

  let x: Result<number, number> = new Ok(2);
  expect(x.map(stringify)).toEqual(new Ok("2"));

  let y: Result<number, number> = new Err(13);
  expect(y.map(stringify)).toEqual(new Err(13));
});

test("`mapErr` works", () => {
  const stringify = (x: number) => x.toString();

  let x: Result<number, number> = new Ok(2);
  expect(x.mapErr(stringify)).toEqual(new Ok(2));

  let y: Result<number, number> = new Err(13);
  expect(y.mapErr(stringify)).toEqual(new Err("13"));
});

test("`mapOr` works", () => {
  let x = new Ok("foo");
  expect(x.mapOr(42, (v) => v.length)).toBe(3);

  let y: Result<string, string> = new Err("bar");
  expect(y.mapOr(42, (v) => v.length)).toBe(42);
});

test("`match` works", () => {
  const ok = (x: number) => x;
  const err = (_: number) => 0;

  let x: Result<number, number> = new Ok(2);
  expect(x.match(ok, err)).toBe(2);

  let y: Result<number, number> = new Err(-1);
  expect(y.match(ok, err)).toBe(0);
});

test("`or` works", () => {
  let a = new Ok(2);
  let b: Result<number, string> = new Err("err");
  expect(a.or(b)).toEqual(new Ok(2));
  expect(b.or(a)).toEqual(new Ok(2));

  let c = new Err("some");
  let d = new Err("error");
  expect(c.or(d)).toEqual(new Err("error"));

  let e = new Ok(2);
  let f = new Ok(100);
  expect(e.or(f)).toEqual(new Ok(2));
});
