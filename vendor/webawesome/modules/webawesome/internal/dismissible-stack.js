const dismissibleStack = [];
export function registerDismissible(key) {
  unregisterDismissible(key);
  dismissibleStack.push(key);
}
export function unregisterDismissible(key) {
  for (let i = dismissibleStack.length - 1;i >= 0; i--) {
    if (dismissibleStack[i] === key) {
      dismissibleStack.splice(i, 1);
      break;
    }
  }
}
export function isTopDismissible(key) {
  return dismissibleStack.length > 0 && dismissibleStack[dismissibleStack.length - 1] === key;
}
