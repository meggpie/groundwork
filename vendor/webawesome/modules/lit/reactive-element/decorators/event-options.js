export function eventOptions(options) {
  return (protoOrValue, nameOrContext) => {
    const method = typeof protoOrValue === "function" ? protoOrValue : protoOrValue[nameOrContext];
    Object.assign(method, options);
  };
}
