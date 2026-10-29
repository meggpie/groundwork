export function* join(items, joiner) {
  const isFunction = typeof joiner === "function";
  if (items !== undefined) {
    let i = -1;
    for (const value of items) {
      if (i > -1) {
        yield isFunction ? joiner(i) : joiner;
      }
      i++;
      yield value;
    }
  }
}
