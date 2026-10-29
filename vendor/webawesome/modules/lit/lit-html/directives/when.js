export function when(condition, trueCase, falseCase) {
  return condition ? trueCase(condition) : falseCase?.(condition);
}
