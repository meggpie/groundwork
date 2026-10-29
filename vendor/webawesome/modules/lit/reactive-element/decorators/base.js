export const desc = (obj, name, descriptor) => {
  descriptor.configurable = true;
  descriptor.enumerable = true;
  if (Reflect.decorate && typeof name !== "object") {
    Object.defineProperty(obj, name, descriptor);
  }
  return descriptor;
};
