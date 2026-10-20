import { css, unsafeCSS } from 'lit';
import playerStyles from '../../../shared/podcast/player.css?inline';

export const podcastStyles = css`
  :host { display: block; width: 100%; min-width: 0; }
  .podcast-player { margin: 24px 0; }
  ${unsafeCSS(playerStyles)}
`;
