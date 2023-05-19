import { css } from "lit";

export const normalizeStyle = css`
  :host {
    font-size: var(--waline-font-size);
    text-align: start;
  }

  [dir="rtl"]:host {
    direction: rtl;
  }

  * {
    box-sizing: content-box;
    line-height: 1.75;
  }

  p {
    color: var(--waline-color);
  }

  a {
    position: relative;

    display: inline-block;

    color: var(--waline-theme-color);

    text-decoration: none;
    word-break: break-word;

    cursor: pointer;
  }

  a:hover {
    color: var(--waline-active-color);
  }

  img {
    max-width: 100%;
    max-height: 400px;
    border: none;
  }

  hr {
    margin: 0.825em 0;
    border-style: dashed;
    border-color: var(--waline-bg-color-light);
  }

  code,
  pre {
    margin: 0;
    padding: 0.2em 0.4em;
    border-radius: 3px;

    background: var(--waline-bg-color-light);

    font-size: 85%;
  }

  pre {
    overflow: auto;
    padding: 10px;
    line-height: 1.45;
  }
  pre::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  pre::-webkit-scrollbar-track-piece:horizontal {
    -webkit-border-radius: 6px;
    border-radius: 6px;
    background: rgb(0 0 0 / 10%);
  }

  pre::-webkit-scrollbar-thumb:horizontal {
    width: 6px;
    -webkit-border-radius: 6px;
    border-radius: 6px;
    background: var(--waline-theme-color);
  }

  pre code {
    padding: 0;

    background: transparent;
    color: var(--waline-color);

    white-space: pre-wrap;
    word-break: keep-all;
  }

  blockquote {
    margin: 0.5em 0;
    padding: 0.5em 0 0.5em 1em;
    border-inline-start: 8px solid var(--waline-bq-color);
    color: var(--waline-dark-grey);
  }

  blockquote > p {
    margin: 0;
  }

  ol,
  ul {
    margin-inline-start: 1.25em;
    padding: 0;
  }

  input[type="checkbox"],
  input[type="radio"] {
    display: inline-block;
    vertical-align: middle;
    margin-top: -2px;
  }
`;
