import { css } from "lit";

export const cardStyle = css`
  .wl-cards .wl-user {
    --avatar-size: var(--waline-avatar-size);
    position: relative;
    margin-inline-end: 0.75em;
  }
  @media (max-width: 720px) {
    .wl-cards .wl-user {
      --avatar-size: var(--waline-m-avatar-size);
    }
  }
  .wl-cards .wl-user img {
    width: var(--avatar-size);
    height: var(--avatar-size);
    border-radius: var(--waline-avatar-radius);
    box-shadow: var(--waline-box-shadow);
  }
  .wl-cards .wl-user .verified-icon {
    position: absolute;
    top: calc(var(--avatar-size) * 3 / 4);
    inset-inline-start: calc(var(--avatar-size) * 3 / 4);
    border-radius: 50%;
    background: var(--waline-bgcolor);
    box-shadow: var(--waline-box-shadow);
  }
  .wl-card-item {
    position: relative;
    display: flex;
    padding: 0.5em;
  }
  .wl-card-item .wl-card-item {
    padding-inline-end: 0;
  }
  .wl-card {
    flex: 1;
    width: 0;
    padding-bottom: 0.5em;
    border-bottom: 1px dashed var(--waline-border-color);
  }
  .wl-card:first-child {
    margin-inline-start: 1em;
  }
  .wl-card-item:last-child > .wl-card {
    border-bottom: none;
  }
  .wl-card .wl-nick svg {
    position: relative;
    bottom: -0.125em;
    line-height: 1;
  }
  .wl-card .wl-head {
    overflow: hidden;
    line-height: 1.5;
  }
  .wl-card .wl-head .wl-nick {
    position: relative;
    display: inline-block;
    margin-inline-end: 0.5em;
    font-weight: bold;
    font-size: 0.875em;
    line-height: 1;
    text-decoration: none;
  }
  .wl-card span.wl-nick {
    color: var(--waline-dark-grey);
  }
  .wl-card .wl-badge {
    display: inline-block;
    margin-inline-end: 1em;
    padding: 0 0.3em;
    border: 1px solid var(--waline-badge-color);
    border-radius: 4px;
    color: var(--waline-badge-color);
    font-size: var(--waline-badge-font-size);
  }
  .wl-card .wl-time {
    margin-inline-end: 0.875em;
    color: var(--waline-info-color);
    font-size: 0.75em;
  }
  .wl-card .wl-meta {
    position: relative;
    line-height: 1;
  }
  .wl-card .wl-meta > span {
    display: inline-block;
    margin-inline-end: 0.25em;
    padding: 2px 4px;
    border-radius: 0.2em;
    background: var(--waline-info-bgcolor);
    color: var(--waline-info-color);
    font-size: var(--waline-info-font-size);
    line-height: 1.5;
  }
  .wl-card .wl-meta > span:empty {
    display: none;
  }
  .wl-card .wl-comment-actions {
    float: right;
    line-height: 1;
  }
  [dir="rtl"] .wl-card .wl-comment-actions {
    float: left;
  }
  .wl-card .wl-delete,
  .wl-card .wl-like,
  .wl-card .wl-reply,
  .wl-card .wl-edit {
    display: inline-flex;
    align-items: center;
    border: none;
    background: rgba(0, 0, 0, 0);
    color: var(--waline-color);
    line-height: 1;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .wl-card .wl-delete:hover,
  .wl-card .wl-like:hover,
  .wl-card .wl-reply:hover,
  .wl-card .wl-edit:hover {
    color: var(--waline-theme-color);
  }
  .wl-card .wl-delete.active,
  .wl-card .wl-like.active,
  .wl-card .wl-reply.active,
  .wl-card .wl-edit.active {
    color: var(--waline-active-color);
  }
  .wl-card .wl-content {
    position: relative;
    margin-bottom: 0.75em;
    padding-top: 0.625em;
    font-size: 0.875em;
    line-height: 2;
    word-wrap: break-word;
  }
  .wl-card .wl-content.expand {
    overflow: hidden;
    max-height: 8em;
    cursor: pointer;
  }
  .wl-card .wl-content.expand::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 3.15em;
    inset-inline-start: 0;
    z-index: 999;
    display: block;
    width: 100%;
    background: linear-gradient(180deg, #000, rgba(255, 255, 255, 0.9));
  }
  .wl-card .wl-content.expand::after {
    content: attr(data-expand);
    position: absolute;
    bottom: 0;
    inset-inline-start: 0;
    z-index: 999;
    display: block;
    width: 100%;
    height: 3.15em;
    background: rgba(255, 255, 255, 0.9);
    color: #828586;
    line-height: 3.15em;
    text-align: center;
  }
  .wl-card .wl-content > *:first-child {
    margin-top: 0;
  }
  .wl-card .wl-content > *:last-child {
    margin-bottom: 0;
  }
  .wl-card .wl-admin-actions {
    margin: 8px 0;
    font-size: 12px;
    text-align: right;
  }
  .wl-card .wl-comment-status {
    margin: 0 8px;
  }
  .wl-card .wl-comment-status .wl-btn {
    border-radius: 0;
  }
  .wl-card .wl-comment-status .wl-btn:first-child {
    border-inline-end: 0;
    border-radius: 0.5em 0 0 0.5em;
  }
  .wl-card .wl-comment-status .wl-btn:last-child {
    border-inline-start: 0;
    border-radius: 0 0.5em 0.5em 0;
  }
  .wl-card .wl-quote {
    border-inline-start: 1px dashed rgba(237, 237, 237, 0.5);
  }
  .wl-card .wl-quote .wl-user {
    --avatar-size: var(--waline-m-avatar-size);
  }
`;
