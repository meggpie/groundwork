import { ContextConsumer } from "../controllers/context-consumer.js";
export function consume({
  context,
  subscribe
}) {
  return (protoOrTarget, nameOrContext) => {
    if (typeof nameOrContext === "object") {
      nameOrContext.addInitializer(function() {
        new ContextConsumer(this, {
          context,
          callback: (value) => {
            protoOrTarget.set.call(this, value);
          },
          subscribe
        });
      });
    } else {
      protoOrTarget.constructor.addInitializer((element) => {
        new ContextConsumer(element, {
          context,
          callback: (value) => {
            element[nameOrContext] = value;
          },
          subscribe
        });
      });
    }
  };
}
