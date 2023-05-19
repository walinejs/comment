import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DEFAULT_LANG, DEFAULT_LOCALES } from "../config/index.js";
import { type WalineCommentSorting } from "../typings/index.js";
import {
  UserInfo,
  WalineComment,
  WalineCommentStatus,
  WalineRootComment,
  deleteComment,
  getComment,
  updateComment,
} from "@waline/api";
import { getServerURL } from "../utils/config.js";
import { loadingIcon } from "./loading-icon.js";
import { normalizeStyle } from "../styles/normalize.js";
import { baseStyle } from "../styles/base.js";

declare const VERSION: string;

export const USER_KEY = "WALINE_USER";
const LIKE_KEY = "WALINE_LIKE";

export type LikeID = string;

type SortKey = "insertedAt_desc" | "insertedAt_asc" | "like_desc";

const supportedLanguages = Object.keys(DEFAULT_LOCALES);

const sortKeyMap: Record<WalineCommentSorting, SortKey> = {
  latest: "insertedAt_desc",
  oldest: "insertedAt_asc",
  hottest: "like_desc",
};
const sortingMethods = Object.keys(sortKeyMap) as WalineCommentSorting[];

interface WalineCommentState {
  count: number;
  page: number;
  totalPages: number;
  data: WalineRootComment[];
}

/**
 * An example element.
 *
 * @prop {string} server - Waline ServerURL
 * @prop {string} identify - Waline Identify
 * @prop {string} commentSorting - Waline Comment Sorting
 * @prop {number} pageSize - Comment count per page
 * @prop {string} language - Waline UI Language
 * @prop {boolean} noCopyRight - Hide copyRight
 * @csspart button - The button
 */
@customElement("waline-comment")
export class WalineRoot extends LitElement {
  static override styles = [normalizeStyle, baseStyle];

  /**
   * Waline ServerURL
   */
  @property({ type: String })
  server = "latest";

  /**
   * Waline ServerURL
   */
  @property({ type: String })
  identify = window.location.pathname;

  /**
   * Waline Comment Sorting
   */
  @property({ type: String, attribute: "comment-sorting" })
  commentSorting: WalineCommentSorting = "latest";

  /**
   * Comment count per page
   */
  @property({ type: Number })
  pageSize = 10;

  /**
   * Waline UI Language
   */
  @property({ type: String })
  language =
    navigator.languages.find((lang) =>
      supportedLanguages.includes(lang.toLowerCase())
    ) ?? "";

  /**
   *  copyright
   */
  @property({ type: Boolean })
  noCopyright = false;

  @state()
  userInfo: UserInfo | Record<string, never> = {};

  @state()
  likes: string[] = [];

  @state()
  private status: "loading" | "success" | "error" = "loading";

  @state()
  private state: WalineCommentState = {
    count: 0,
    page: 1,
    totalPages: 0,
    data: [],
  };

  @state()
  private reply: WalineComment | null = null;

  @state()
  private edit: WalineComment | null = null;

  private abort: () => void = () => {};

  constructor() {
    super();

    const userInfo = localStorage.getItem(USER_KEY);

    this.userInfo = userInfo ? JSON.parse(userInfo) : {};

    window.addEventListener("storage", ({ key, newValue }) => {
      if (key === USER_KEY) {
        this.userInfo = newValue ? JSON.parse(newValue) : {};
      } else if (key === LIKE_KEY) {
        this.likes = newValue ? JSON.parse(newValue) : [];
      }
    });
  }

  get serverURL() {
    if (!this.server) throw new Error("server is required");

    return getServerURL(this.server);
  }

  get i18n() {
    return (
      DEFAULT_LOCALES[this.language.toLowerCase()] ||
      DEFAULT_LOCALES[DEFAULT_LANG]
    );
  }

  override render() {
    const { i18n, status, state } = this;

    return html`<div>
      <div id="waline-reaction">
        <!-- TODO: Add reaction component -->
      </div>
      <div class="wl-meta-head">
        <div class="wl-count">
          ${state.count ? html`<span class="wl-num">${state.count}</span>` : ""}
          ${i18n.comment}
        </div>
        <ul class="wl-sort">
          ${sortingMethods.map(
            (item) => html`
              <li
                class="${item === this.commentSorting ? "active" : ""}"
                @click="${() => this.onSortByChange(item)}"
              >
                ${i18n[item]}
              </li>
            `
          )}
        </ul>
      </div>
      <div class="wl-cards">
        ${state.data.map(
          (comment) => html`<waline-card
            .comment="${comment}"
            .root-id="${comment.objectId}"
            .reply="${this.reply}"
            .edit="${this.edit}"
            .root="${this}"
            @reply="${this.onReply}"
            @edit="${this.onEdit}"
            @like="${this.onLike}"
            @delete="${this.onDelete}"
            @submit="${this.onSubmit}"
          />`
        )}
      </div>
      ${status === "error"
        ? html`
            <div class="wl-operation">
              <button type="button" @click="${this.refresh}">
                ${i18n.refresh}
              </button>
            </div>
          `
        : status === "loading"
        ? html`<div class="wl-loading">${loadingIcon({ size: 30 })}</div>`
        : !state.data.length
        ? html`<div class="wl-empty">${i18n.sofa}</div>`
        : state.page < state.totalPages
        ? html`<div class="wl-operation">
            <button
              type="button"
              class="wl-btn"
              @click="${() => this.getCommentData(state.page + 1)}"
            >
              ${i18n.more}
            </button>
          </div>`
        : ""}
      ${this.noCopyright
        ? ""
        : html`
            <div class="wl-power">
              Powered by
              <a
                href="https://waline.js.org"
                target="_blank"
                rel="noopener noreferrer"
                >Waline</a
              >
              v${VERSION}
            </div>
          `}
    </div>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.refresh();
  }

  getCommentData(pageNumber: number): void {
    const {
      commentSorting,
      language,
      serverURL,
      identify,
      pageSize,
      userInfo,
    } = this;
    const controller = new AbortController();

    this.status = "loading";

    this.abort?.();

    getComment({
      serverURL,
      lang: language,
      path: identify,
      pageSize,
      sortBy: sortKeyMap[commentSorting],
      page: pageNumber,
      signal: controller.signal,
      token: userInfo.token,
    })
      .then(({ count, data, totalPages }) => {
        this.status = "success";
        this.state = {
          count,
          data: [...this.state.data, ...data],
          totalPages,
          page: pageNumber,
        };
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          console.error(err.message);
          this.status = "error";
        }
      });

    this.abort = controller.abort.bind(controller);
  }

  refresh() {
    this.state = { ...this.state, count: 0, data: [] };
    this.getCommentData(1);
  }

  onSortByChange(item: WalineCommentSorting): void {
    if (this.commentSorting !== item) {
      this.commentSorting = item;
      this.refresh();
    }
  }

  onReply(comment: WalineComment | null): void {
    this.reply = comment;
  }

  onEdit(comment: WalineComment | null): void {
    this.edit = comment;
  }

  onSubmit(comment: WalineComment): void {
    if (this.edit) {
      this.edit = {
        ...this.edit,
        comment: comment.comment,
        orig: comment.orig,
      };
    } else if ("rid" in comment) {
      const repliedComment = this.state.data.find(
        ({ objectId }) => objectId === comment.rid
      );

      if (!repliedComment) return;

      if (!Array.isArray(repliedComment.children)) repliedComment.children = [];

      repliedComment.children.push(comment);
    } else this.state = { ...this.state, data: [comment, ...this.state.data] };
  }

  async onStatusChange({
    comment,
    status,
  }: {
    comment: WalineComment;
    status: WalineCommentStatus;
  }): Promise<void> {
    if (comment.status === status) return;

    const { serverURL, lang } = this;

    await updateComment({
      serverURL,
      lang,
      token: this.userInfo.token,
      objectId: comment.objectId,
      comment: { status },
    });

    comment.status = status;
  }

  async onSticky(comment: WalineComment): Promise<void> {
    if ("rid" in comment) return;

    const { serverURL, lang } = this;

    await updateComment({
      serverURL,
      lang,
      token: this.userInfo.token,
      objectId: comment.objectId,
      comment: { sticky: comment.sticky ? 0 : 1 },
    });

    comment.sticky = !comment.sticky;
  }

  async onDelete({ objectId }: WalineComment): Promise<void> {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const { serverURL, lang } = this;

    await deleteComment({
      serverURL,
      lang,
      token: this.userInfo.token,
      objectId,
    });

    // delete comment from data
    this.state.data.some((item, index) => {
      if (item.objectId === objectId) {
        this.state = {
          ...this.state,
          data: this.state.data.filter((_item, i) => i !== index),
        };

        return true;
      }

      return item.children.some((child, childIndex) => {
        if (child.objectId === objectId) {
          this.state.data[index].children = item.children.filter(
            (_item, i) => i !== childIndex
          );
          this.requestUpdate("state");

          return true;
        }

        return false;
      });
    });
  }

  async onLike(comment: WalineComment): Promise<void> {
    const { serverURL, lang } = this;
    const { objectId } = comment;
    const hasLiked = this.likes.includes(objectId);

    await updateComment({
      serverURL,
      lang,
      objectId,
      token: this.userInfo.token,
      comment: { like: !hasLiked },
    });

    if (hasLiked) this.likes = this.likes.filter((id) => id !== objectId);
    else {
      this.likes = [...this.likes, objectId];

      if (this.likes.length > 50) this.likes = this.likes.slice(-50);
    }

    comment.like = (comment.like || 0) + (hasLiked ? -1 : 1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "waline-comment": WalineComment;
  }
}
