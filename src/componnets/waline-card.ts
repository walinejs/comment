import {
  WalineComment,
  WalineCommentStatus,
  WalineRootComment,
} from "@waline/api";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { WalineRoot } from "./waline-comment";
import { isLinkHttp } from "../utils/path";
import { verifiedIcon } from "../utils/verifiedIcon";
import { getDate } from "../utils/date";

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

  get isAdmin(): boolean {
    return this.root.userInfo.type === "administrator";
  }

  get isOwner(): boolean {
    return this.comment.user_id === this.root.userInfo.objectId;
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
        ${verifiedIcon}
      </div>
      <div class="wl-card">
        <div class="wl-head">
          ${this.link
            ? html` <a
                class="wl-nick"
                :href="link"
                target="_blank"
                rel="nofollow noopener noreferrer"
                >${this.comment.nick}</a
              >`
            : html`<span class="wl-nick">${this.comment.nick}</span>`}
          ${this.comment.type === "administrator"
            ? html` <span class="wl-badge">${this.root.i18n.admin}</span> `
            : ""}
          ${this.comment.label
            ? html`<span class="wl-badge">${this.comment.label}</span>`
            : ""}
          ${(this.comment as WalineRootComment).sticky
            ? html`<span class="wl-badge">${this.root.i18n.sticky}</span>`
            : ""}
          ${typeof this.comment["level"] === "number"
            ? html`<span class="wl-badge level${this.comment.level}"
                >${this.root.i18n[`level${this.comment.level}`] ||
                `Level ${this.comment.level}`}</span
              >`
            : ""}

          <span class="wl-time">${getDate(this.comment.insertedAt)}</span>

          <div class="wl-comment-actions">
            ${this.isAdmin || this.isOwner
              ? html`<button
                  v-if=""
                  type="button"
                  class="wl-edit"
                  @click="${this.editComment}"
                >
                  <EditIcon />
                </button>`
              : ""}

            <button
              v-if="isAdmin || isOwner"
              type="button"
              class="wl-delete"
              @click="$emit('delete', comment)"
            >
              <DeleteIcon />
            </button>

            <button
              type="button"
              class="wl-like"
              :title="like ? locale.cancelLike : locale.like"
              @click="$emit('like', comment)"
            >
              <LikeIcon :active="like" />

              <span v-if="'like' in comment" v-text="comment.like" />
            </button>

            <button
              type="button"
              class="wl-reply"
              :class="{ active: isReplyingCurrent }"
              :title="isReplyingCurrent ? locale.cancelReply : locale.reply"
              @click="$emit('reply', isReplyingCurrent ? null : comment)"
            >
              <ReplyIcon />
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  private editComment() {
    return this.dispatchEvent(
      new CustomEvent("edit", { detail: this.comment })
    );
  }
}
