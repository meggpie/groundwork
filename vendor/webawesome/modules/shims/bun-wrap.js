export function __legacyDecorateClassTS(decorators, target, key, desc) {
  const c = arguments.length;
  let r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  for (let i = decorators.length - 1;i >= 0; i--)
    if (d = decorators[i])
      r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  if (c > 3 && r)
    Object.defineProperty(target, key, r);
  return r;
}
