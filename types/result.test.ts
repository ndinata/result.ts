import { Err, Ok, Result } from './result';

test('`unwrap` works', () => {
  const x = new Ok(4);
  expect(x.unwrap()).toBe(4);

  const y = new Err('error');
  expect(y.unwrapErr()).toBe('error');
});

test('`unwrapOr` works', () => {
  const fallback = 2;

  const x = new Ok(4);
  expect(x.unwrapOr(fallback)).toBe(4);

  const y = new Err('error');
  expect(y.unwrapOr(fallback)).toBe(fallback);
});

test('`isOk` works', () => {
  const x = new Ok(-3);
  expect(x.isOk()).toBeTruthy();
  expect(x.ok()).toBe(-3);

  const y = new Err('error');
  expect(y.isOk()).toBeFalsy();
  expect(y.ok()).toBe(undefined);
});

test('`isErr` works', () => {
  const x = new Ok(-3);
  expect(x.isErr()).toBeFalsy();
  expect(x.err()).toBe(undefined);

  const y = new Err('error');
  expect(y.isErr()).toBeTruthy();
  expect(y.err()).toBe('error');
});

test('`map` works', () => {
  const stringify = (x: number) => x.toString();

  const x: Result<number, number> = new Ok(2);
  expect(x.map(stringify)).toEqual(new Ok('2'));

  const y: Result<number, number> = new Err(13);
  expect(y.map(stringify)).toEqual(new Err(13));
});

test('`mapErr` works', () => {
  const stringify = (x: number) => x.toString();

  const x: Result<number, number> = new Ok(2);
  expect(x.mapErr(stringify)).toEqual(new Ok(2));

  const y: Result<number, number> = new Err(13);
  expect(y.mapErr(stringify)).toEqual(new Err('13'));
});

test('`mapOr` works', () => {
  const x = new Ok('foo');
  expect(x.mapOr(42, (v) => v.length)).toBe(3);

  const y: Result<string, string> = new Err('bar');
  expect(y.mapOr(42, (v) => v.length)).toBe(42);
});

test('`match` works', () => {
  const ok = (x: number) => x;
  const err = (_: number) => 0;

  const x: Result<number, number> = new Ok(2);
  expect(x.match(ok, err)).toBe(2);

  const y: Result<number, number> = new Err(-1);
  expect(y.match(ok, err)).toBe(0);
});

test('`and` works', () => {
  const a: Result<number, string> = new Ok(2);
  const b: Result<number, string> = new Err('err');
  expect(a.and(b)).toEqual(new Err('err'));
  expect(b.and(a)).toEqual(new Err('err'));

  const c = new Err('some');
  const d = new Err('error');
  expect(c.and(d)).toEqual(new Err('some'));

  const e = new Ok(2);
  const f = new Ok(100);
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
  const a = new Ok(2);
  const b: Result<number, string> = new Err('err');
  expect(a.or(b)).toEqual(new Ok(2));
  expect(b.or(a)).toEqual(new Ok(2));

  const c = new Err('some');
  const d = new Err('error');
  expect(c.or(d)).toEqual(new Err('error'));

  const e = new Ok(2);
  const f = new Ok(100);
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
  const unthrowing = () => 100;
  expect(Result.wrap(unthrowing)).toEqual(new Ok(100));

  const throwing = (input: number) => {
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
  const sleep = async () =>
    new Promise((r) => {
      setTimeout(r, 1000);
    });

  const asyncThrowing = async (input: number) => {
    await sleep();
    if (input >= 0) {
      return 42;
    }

    throw new Error('err');
  };

  expect(await Result.asyncWrap(async () => asyncThrowing(1))).toEqual(
    new Ok(42),
  );
  expect(await Result.asyncWrap(async () => asyncThrowing(-1))).toEqual(
    new Err(new Error('err')),
  );
});
