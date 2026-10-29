import {
  _$LH as p,
  noChange
} from "./lit-html.js";
let resolveMethodName = null;
export const _$LH = {
  boundAttributeSuffix: p._boundAttributeSuffix,
  marker: p._marker,
  markerMatch: p._markerMatch,
  HTML_RESULT: p._HTML_RESULT,
  getTemplateHtml: p._getTemplateHtml,
  overrideDirectiveResolve: (directiveClass, resolveOverrideFn) => class extends directiveClass {
    _$resolve(_part, values) {
      return resolveOverrideFn(this, values);
    }
  },
  patchDirectiveResolve: (directiveClass, resolveOverrideFn) => {
    if (directiveClass.prototype._$resolve.name !== resolveOverrideFn.name) {
      resolveMethodName ??= directiveClass.prototype._$resolve.name;
      for (let proto = directiveClass.prototype;proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
        if (proto.hasOwnProperty(resolveMethodName)) {
          proto[resolveMethodName] = resolveOverrideFn;
          return;
        }
      }
      throw new Error(`Internal error: It is possible that both dev mode and production mode` + ` Lit was mixed together during SSR. Please comment on the issue: ` + `https://github.com/lit/lit/issues/4527`);
    }
  },
  setDirectiveClass(value, directiveClass) {
    value["_$litDirective$"] = directiveClass;
  },
  getAttributePartCommittedValue: (part, value, index) => {
    let committedValue = noChange;
    part._commitValue = (value) => committedValue = value;
    part._$setValue(value, part, index);
    return committedValue;
  },
  connectedDisconnectable: (props) => ({
    ...props,
    _$isConnected: true
  }),
  resolveDirective: p._resolveDirective,
  AttributePart: p._AttributePart,
  PropertyPart: p._PropertyPart,
  BooleanAttributePart: p._BooleanAttributePart,
  EventPart: p._EventPart,
  ElementPart: p._ElementPart,
  TemplateInstance: p._TemplateInstance,
  isIterable: p._isIterable,
  ChildPart: p._ChildPart
};
