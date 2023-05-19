import { css } from "lit";

export const baseStyle = css`
  .wl-btn {
    display: inline-block;
    vertical-align: middle;

    min-width: 2.5em;
    margin-bottom: 0;
    padding: 0.5em 1em;
    border: 1px solid var(--waline-border-color);
    border-radius: 0.5em;

    background: transparent;
    color: var(--waline-color);

    font-weight: 400;
    font-size: 0.75em;
    line-height: 1.5;
    text-align: center;
    white-space: nowrap;

    cursor: pointer;
    user-select: none;

    transition-duration: 0.4s;

    touch-action: manipulation;
  }

  .wl-btn:hover,
  .wl-btn:active {
    border-color: var(--waline-theme-color);
    color: var(--waline-theme-color);
  }

  .wl-btn:disabled {
    border-color: var(--waline-border-color);
    background: var(--waline-disable-bg-color);
    color: var(--waline-disable-color);
    cursor: not-allowed;
  }

  .wl-btn.primary {
    border-color: var(--waline-theme-color);
    background: var(--waline-theme-color);
    color: var(--waline-white);
  }

  .wl-btn.primary:hover,
  .wl-btn.primary:active {
    border-color: var(--waline-active-color);
    background: var(--waline-active-color);
    color: var(--waline-white);
  }

  .wl-btn.primary:disabled {
    border-color: var(--waline-border-color);
    background: var(--waline-disable-bg-color);
    color: var(--waline-disable-color);
    cursor: not-allowed;
  }

  .wl-loading {
    text-align: center;
  }

  .wl-loading svg {
    margin: 0 auto;
  }
`;
