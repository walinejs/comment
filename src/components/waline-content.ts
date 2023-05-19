import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export const walineContent = (content: string) => html`<div class="wl-content">
  ${unsafeHTML(content)}
</div>`;
