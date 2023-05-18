import { WalineComment, WalineCommentStatus } from "@waline/api";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { WalineRoot } from "./waline-comment";
import { isLinkHttp } from "../utils/path";

const commentStatus: WalineCommentStatus[] = ["approved", "waiting", "spam"];

@customElement("waline-card")
export class WalineCard extends LitElement {
  static override styles = css``;

  /**
   * Comment data
   */
  @property({ type: Object })
  comment: WalineComment;

  /**
   * Root comment id
   */
  @property({ attribute: "root-id" })
  rootId = "";

  /**
   * Current comment to be edited
   */
  @property({ type: Object })
  edit: WalineComment | null = null;

  constructor() {
    super();
    this.comment ??= {} as WalineComment;
  }

  get root(): WalineRoot {
    return this.getRootNode() as WalineRoot;
  }

  get link(): string {
    const { link } = this.comment;

    return link ? (isLinkHttp(link) ? link : `https://${link}`) : "";
  }

  get like(): boolean {
    return this.root.likes.includes(this.comment.objectId);
  }

  /**
   * Current comment to be replied
   */
  @property({ type: Object })
  reply: WalineComment | null = null;

  override render() {
    return html`<div id=${this.comment.objectId} class="wl-card-item">
      <div class="wl-user" aria-hidden="true">
        ${this.comment.avatar
          ? html`<img src=${this.comment.avatar} alt=${this.comment.nick} />`
          : ""}
      </div>
    </div>`;
  }
}
