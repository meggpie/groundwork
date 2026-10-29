export const choose = (value, cases, defaultCase) => {
  for (const c of cases) {
    const caseValue = c[0];
    if (caseValue === value) {
      const fn = c[1];
      return fn();
    }
  }
  return defaultCase?.();
};
