export function* map(items, f) {
  if (items !== undefined) {
    let i = 0;
    for (const value of items) {
      yield f(value, i++);
    }
  }
}
