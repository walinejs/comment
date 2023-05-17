import { type TemplateResult, render } from "lit-html";
import { shallowReactive, effect } from "@vue/reactivity";

let currentInstance;

export * from "@vue/reactivity";
export * from "lit-html";

export function defineComponent<T extends Record<string, unknown>>(
  name: string,
  propDefs: (keyof T)[],
  factory: (props: T) => () => TemplateResult<1>
) {
  const Component = class extends HTMLElement {
    _props: T;
    _bm: (() => void)[];
    _m: (() => void)[];
    _u: (() => void)[];
    _um: (() => void)[];
    _bu: (() => void)[];

    constructor() {
      super();
      const props = (this._props = shallowReactive<T>({} as T));

      currentInstance = this;

      const template = factory.call(this, props);

      currentInstance = null;

      this._bm?.forEach((cb) => cb());

      const root = this.attachShadow({ mode: "closed" });
      let isMounted = false;

      effect(() => {
        if (!isMounted) this._bu?.forEach((cb) => cb());

        render(template(), root);

        if (isMounted) this._u?.forEach((cb) => cb());
        else isMounted = true;
      });
      // Remove an instance properties that alias reactive properties which
      // might have been set before the element was upgraded.
      for (const propName of propDefs) {
        if (this.hasOwnProperty(propName)) {
          // @ts-ignore
          const v = this[propName];

          // @ts-ignore
          delete this[propName];
          // @ts-ignore
          this[propName] = v;
        }
      }
    }

    static get observedAttributes() {
      return propDefs;
    }

    connectedCallback() {
      this._m?.forEach((cb) => cb());
    }
    disconnectedCallback() {
      this._um?.forEach((cb) => cb());
    }

    attributeChangedCallback(
      name: string,
      _oldValue: unknown,
      newValue: unknown
    ) {
      // @ts-ignore
      this._props[name] = newValue;
    }
  };

  for (const propName of propDefs) {
    Object.defineProperty(Component.prototype, propName, {
      get() {
        return this._props[propName];
      },
      set(v) {
        this._props[propName] = v;
      },
    });
  }

  customElements.define(name, Component);
}

const createLifecycleMethod = (name) => (callback) => {
  if (currentInstance) (currentInstance[name] ??= []).push(callback);
};

export const onBeforeMount = createLifecycleMethod("_bm");
export const onMounted = createLifecycleMethod("_m");
export const onBeforeUpdate = createLifecycleMethod("_bu");
export const onUpdated = createLifecycleMethod("_u");
export const onUnmounted = createLifecycleMethod("_um");
