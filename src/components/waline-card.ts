import {
  WalineComment,
  WalineCommentStatus,
  WalineRootComment,
} from "@waline/api";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { WalineRoot } from "./waline-comment.js";
import { editIcon } from "./edit-icon.js";
import { verifiedIcon } from "./verified-icon.js";
import { isLinkHttp } from "../utils/path";
import { getDate } from "../utils/date";
import { deleteIcon } from "./delete-icon.js";
import { likeIcon } from "./like-icon.js";
import { replyIcon } from "./reply-icon.js";
import { walineContent } from "./waline-content.js";
import { normalizeStyle } from "../styles/normalize.js";
import { baseStyle } from "../styles/base.js";
import { cardStyle } from "../styles/card.js";

const commentStatus: WalineCommentStatus[] = ["approved", "waiting", "spam"];

@customElement("waline-card")
export class WalineCard extends LitElement {
  static override styles = [normalizeStyle, baseStyle, cardStyle];

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

  /**
   * Current comment to be replied
   */
  @property({ type: Object })
  reply: WalineComment | null = null;
  /**
   * Comment data
   */
  @property({ type: Object })
  root: WalineRoot = null;

  constructor() {
    super();
    this.comment ??= {} as WalineComment;
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

  get isEditing(): boolean {
    return this.edit?.objectId === this.comment.objectId;
  }

  get isReplying(): boolean {
    return this.reply?.objectId === this.comment.objectId;
  }

  override render() {
    console.log(this.root);
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
            ? html`<a
                class="wl-nick"
                :href="link"
                target="_blank"
                rel="nofollow noopener noreferrer"
                >${this.comment.nick}</a
              >`
            : html`<span class="wl-nick">${this.comment.nick}</span>`}
          ${this.comment.type === "administrator"
            ? html`<span class="wl-badge">${this.root.i18n.admin}</span>`
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
                    type="button"
                    class="wl-edit"
                    @click="${() => this.event("edit")}"
                  >
                    ${editIcon}
                  </button>
                  <button
                    type="button"
                    class="wl-delete"
                    @click="${() => this.event("delete")}"
                  >
                    ${deleteIcon}
                  </button> `
              : ""}

            <button
              type="button"
              class="wl-like"
              title="${this.like
                ? this.root.i18n.cancelLike
                : this.root.i18n.like}"
              @click="${() => this.event("like")}"
            >
              ${likeIcon(this.like)}
              ${"like" in this.comment ? this.comment.like : ""}
            </button>

            <button
              type="button"
              class="wl-reply ${this.isReplying ? "active" : ""}"
              title="${this.isReplying
                ? this.root.i18n.cancelReply
                : this.root.i18n.reply}"
              @click="${() =>
                this.event("reply", this.isReplying ? null : this.comment)}"
            >
              ${replyIcon}
            </button>
          </div>
        </div>
        <div class="wl-meta" aria-hidden="true">
          ${(["addr", "browser", "os"] as const).map((item) =>
            this.comment[item]
              ? html`<span class="wl-${item}" data-value="${this.comment[item]}"
                  >${this.comment[item]}</span
                >`
              : ""
          )}
        </div>

        ${walineContent(this.comment.comment)}
        ${this.isAdmin && !this.isEditing
          ? html`<div class="wl-admin-actions">
              <span class="wl-comment-status">
                ${commentStatus.map(
                  (status) =>
                    html`<button
                      type="submit"
                      class="${`wl-btn wl-${status}`}"
                      disabled="${this.comment.status === status}"
                      @click="${() =>
                        this.event("status", {
                          status,
                          comment: this.comment,
                        })}"
                      v-text="locale[status]"
                    >
                      ${this.root.i18n[status]}
                    </button>`
                )}
              </span>

              ${this.isAdmin && !("rid" in this.comment)
                ? html`<button
                    type="submit"
                    class="wl-btn wl-sticky"
                    @click="${() => this.event("sticky")}"
                  >
                    ${this.comment.sticky
                      ? this.root.i18n.unsticky
                      : this.root.i18n.sticky}
                  </button>`
                : ""}
            </div>`
          : ""}
        <!-- TODO: CommentBox -->
        ${"children" in this.comment
          ? html`<div class="wl-quote">
              ${this.comment.children.map(
                (child) => html`<CommentCard
                  comment="${child}"
                  :root-id="${this.rootId}"
                  :reply="${this.reply}"
                  :edit="${this.edit}"
                  @event="${this.dispatchEvent}"
                />`
              )}
            </div>`
          : ""}
      </div>
    </div>`;
  }

  private event(name: string, detail?: unknown) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail: detail === undefined ? this.comment : detail,
      })
    );
  }
}
