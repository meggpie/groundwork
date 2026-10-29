import { ContextProvider } from "../controllers/context-provider.js";
export function provide({
  context
}) {
  return (protoOrTarget, nameOrContext) => {
    const controllerMap = new WeakMap;
    if (typeof nameOrContext === "object") {
      return {
        get() {
          return protoOrTarget.get.call(this);
        },
        set(value) {
          controllerMap.get(this).setValue(value);
          return protoOrTarget.set.call(this, value);
        },
        init(value) {
          controllerMap.set(this, new ContextProvider(this, { context, initialValue: value }));
          return value;
        }
      };
    } else {
      protoOrTarget.constructor.addInitializer((element) => {
        controllerMap.set(element, new ContextProvider(element, { context }));
      });
      const descriptor = Object.getOwnPropertyDescriptor(protoOrTarget, nameOrContext);
      let newDescriptor;
      if (descriptor === undefined) {
        const valueMap = new WeakMap;
        newDescriptor = {
          get() {
            return valueMap.get(this);
          },
          set(value) {
            controllerMap.get(this).setValue(value);
            valueMap.set(this, value);
          },
          configurable: true,
          enumerable: true
        };
      } else {
        const oldSetter = descriptor.set;
        newDescriptor = {
          ...descriptor,
          set(value) {
            controllerMap.get(this).setValue(value);
            oldSetter?.call(this, value);
          }
        };
      }
      Object.defineProperty(protoOrTarget, nameOrContext, newDescriptor);
      return;
    }
  };
}
