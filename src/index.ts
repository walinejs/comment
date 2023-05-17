import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DEFAULT_LANG, DEFAULT_LOCALES } from "./config/index.js";
import { type WalineCommentSorting } from "./typings/index.js";
import { UserInfo, WalineRootComment, getComment } from "@waline/api";
import { getServerURL } from "./utils/config.js";

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

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("waline-comment")
export class WalineComment extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

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

  @state()
  private userInfo: UserInfo | Record<string, never> = {};

  @state()
  private likes: string[] = [];

  @state()
  private status: "loading" | "success" | "error" = "loading";

  @state()
  private count = 0;

  @state()
  private page = 1;

  @state()
  private totalPages = 0;

  @state()
  private data: WalineRootComment[] = [];

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
    console.log(this.i18n);
    return html`<div>
      <div id="waline-reaction"></div>
      <div class="wl-meta-head">
        <div class="wl-count">
          ${this.count ? html`<span class="wl-num">${this.count}</span>` : ""}
          ${this.i18n.comment}
        </div>
      </div>
    </div>`;
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
        this.count = count;
        this.data = [...this.data, ...data];
        this.page = pageNumber;
        this.totalPages = totalPages;
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          console.error(err.message);
          this.status = "error";
        }
      });

    this.abort = controller.abort.bind(controller);
  }

  loadMore() {
    return this.getCommentData(this.page + 1);
  }

  refresh() {
    this.count = 0;
    this.data = [];
    this.getCommentData(1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "waline-comment": WalineComment;
  }
}
