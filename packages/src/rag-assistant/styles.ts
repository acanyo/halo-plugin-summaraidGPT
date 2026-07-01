import type { CSSResultGroup } from 'lit';
import { baseStyles } from './styles/base';
import { composerStyles } from './styles/composer';
import { contentStyles } from './styles/content';
import { petStyles } from './styles/pet';
import { stageStyles } from './styles/stage';

export const ragAssistantStyles: CSSResultGroup = [
  baseStyles,
  petStyles,
  contentStyles,
  composerStyles,
  stageStyles,
];
