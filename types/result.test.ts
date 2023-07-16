import { Err, Ok, Result } from './result';

test('`unwrap` works', () => {
  let x = new Ok(4);
  expect(x.unwrap()).toBe(4);

  let y = new Err('error');
  expect(y.unwrapErr()).toBe('error');
});

test('`unwrapOr` works', () => {
  let fallback = 2;

  let x = new Ok(4);
  expect(x.unwrapOr(fallback)).toBe(4);

  let y = new Err('error');
  expect(y.unwrapOr(fallback)).toBe(fallback);
});

test('`isOk` works', () => {
  let x = new Ok(-3);
  expect(x.isOk()).toBeTruthy();
  expect(x.ok()).toBe(-3);

  let y = new Err('error');
  expect(y.isOk()).toBeFalsy();
  expect(y.ok()).toBe(undefined);
});

test('`isErr` works', () => {
  let x = new Ok(-3);
  expect(x.isErr()).toBeFalsy();
  expect(x.err()).toBe(undefined);

  let y = new Err('error');
  expect(y.isErr()).toBeTruthy();
  expect(y.err()).toBe('error');
});

test('`map` works', () => {
  const stringify = (x: number) => x.toString();

  let x: Result<number, number> = new Ok(2);
  expect(x.map(stringify)).toEqual(new Ok('2'));

  let y: Result<number, number> = new Err(13);
  expect(y.map(stringify)).toEqual(new Err(13));
});

test('`mapErr` works', () => {
  const stringify = (x: number) => x.toString();

  let x: Result<number, number> = new Ok(2);
  expect(x.mapErr(stringify)).toEqual(new Ok(2));

  let y: Result<number, number> = new Err(13);
  expect(y.mapErr(stringify)).toEqual(new Err('13'));
});

test('`mapOr` works', () => {
  let x = new Ok('foo');
  expect(x.mapOr(42, (v) => v.length)).toBe(3);

  let y: Result<string, string> = new Err('bar');
  expect(y.mapOr(42, (v) => v.length)).toBe(42);
});

test('`match` works', () => {
  const ok = (x: number) => x;
  const err = (_: number) => 0;

  let x: Result<number, number> = new Ok(2);
  expect(x.match(ok, err)).toBe(2);

  let y: Result<number, number> = new Err(-1);
  expect(y.match(ok, err)).toBe(0);
});

test('`and` works', () => {
  let a: Result<number, string> = new Ok(2);
  let b: Result<number, string> = new Err('err');
  expect(a.and(b)).toEqual(new Err('err'));
  expect(b.and(a)).toEqual(new Err('err'));

  let c = new Err('some');
  let d = new Err('error');
  expect(c.and(d)).toEqual(new Err('some'));

  let e = new Ok(2);
  let f = new Ok(100);
  expect(e.and(f)).toEqual(new Ok(100));
});

test('`andThen` works', () => {
  const sqThenToString = (x: number): Result<string, string> =>
    new Ok((x * x).toString());

  expect(new Ok(2).andThen(sqThenToString)).toEqual(new Ok('4'));
  expect(new Err<number, string>('nan').andThen(sqThenToString)).toEqual(
    new Err('nan'),
  );
});

test('`or` works', () => {
  let a = new Ok(2);
  let b: Result<number, string> = new Err('err');
  expect(a.or(b)).toEqual(new Ok(2));
  expect(b.or(a)).toEqual(new Ok(2));

  let c = new Err('some');
  let d = new Err('error');
  expect(c.or(d)).toEqual(new Err('error'));

  let e = new Ok(2);
  let f = new Ok(100);
  expect(e.or(f)).toEqual(new Ok(2));
});

test('`orElse` works', () => {
  const sq = (x: number): Result<number, number> => new Ok(x * x);
  const err = (x: number): Result<number, number> => new Err(x);

  expect(new Ok<number, number>(2).orElse(sq).orElse(sq)).toEqual(new Ok(2));
  expect(new Ok<number, number>(2).orElse(err).orElse(sq)).toEqual(new Ok(2));
  expect(new Err<number, number>(3).orElse(sq).orElse(err)).toEqual(new Ok(9));
  expect(new Err<number, number>(3).orElse(err).orElse(err)).toEqual(
    new Err(3),
  );
});

test('`wrap` works', () => {
  let unthrowing = () => 100;
  expect(Result.wrap(unthrowing)).toEqual(new Ok(100));

  let throwing = (input: number) => {
    if (input >= 0) {
      return input;
    }
    throw new Error('err');
  };
  expect(Result.wrap(() => throwing(1))).toEqual(new Ok(1));
  expect(Result.wrap(() => throwing(-1))).toEqual(new Err(new Error('err')));
  expect(Result.wrap(() => throwing(-1), new Error('foo'))).toEqual(
    new Err(new Error('foo')),
  );
});

test('`asyncWrap` works', async () => {
  const sleep = () => new Promise((r) => setTimeout(r, 1000));
  let asyncThrowing = async (input: number) => {
    await sleep();
    if (input >= 0) {
      return 42;
    }
    throw new Error('err');
  };

  expect(Result.asyncWrap(() => asyncThrowing(1))).resolves.toEqual(new Ok(42));
  expect(Result.asyncWrap(() => asyncThrowing(-1))).resolves.toEqual(
    new Err(new Error('err')),
  );
});
