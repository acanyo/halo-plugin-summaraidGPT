import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import semanticSvg from './icons/search-eye-line.svg?raw';
import answerSvg from './icons/sparkling-2-line.svg?raw';
import collapseSvg from './icons/arrow-up-s-line.svg?raw';
import documentSvg from './icons/file-text-line.svg?raw';
import linkSvg from './icons/arrow-right-up-line.svg?raw';
import stopSvg from './icons/stop-circle-line.svg?raw';
import shuffleSvg from './icons/shuffle-line.svg?raw';
import flameSvg from './icons/fire-line.svg?raw';
import refreshSvg from './icons/refresh-line.svg?raw';
import viewSvg from './icons/eye-line.svg?raw';

// Trusted local SVG assets from Remix Icon. See icons/README.md for provenance and license.
export const semanticIcon = unsafeSVG(semanticSvg);
export const answerIcon = unsafeSVG(answerSvg);
export const collapseIcon = unsafeSVG(collapseSvg);
export const documentIcon = unsafeSVG(documentSvg);
export const linkIcon = unsafeSVG(linkSvg);
export const stopIcon = unsafeSVG(stopSvg);
export const shuffleIcon = unsafeSVG(shuffleSvg);
export const flameIcon = unsafeSVG(flameSvg);
export const refreshIcon = unsafeSVG(refreshSvg);
export const viewIcon = unsafeSVG(viewSvg);
