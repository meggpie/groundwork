export function* range(startOrEnd, end, step = 1) {
  const start = end === undefined ? 0 : startOrEnd;
  end ??= startOrEnd;
  for (let i = start;step > 0 ? i < end : end < i; i += step) {
    yield i;
  }
}
