export type PetdexDirection = 'left' | 'right' | '';

export interface PetdexFrame {
  row: number;
  col: number;
}

export interface PetdexAnimationState {
  errorActive: boolean;
  direction: PetdexDirection;
  thinking: boolean;
  hovering: boolean;
}

export interface PetdexMetrics {
  width: number;
  height: number;
  sheetWidth: number;
  sheetHeight: number;
}

export const DEFAULT_RAG_PET_SPEECH_MESSAGES = [
  '有什么站内资料想查？',
  '选中文字后也可以直接问我。',
  '我会优先基于知识库回答。',
  '需要我帮你追溯文章来源吗？',
];

export const PETDEX_THINKING_SPEECH_MESSAGE = '正在检索知识库，稍等一下。';

const PETDEX_SHEET_COLUMNS = 8;
const PETDEX_SHEET_ROWS = 9;
const PETDEX_FRAME_HEIGHT_RATIO = 208 / 192;

const petFrames = (row: number, count: number): PetdexFrame[] => Array.from(
  { length: count },
  (_, col) => ({ row, col }),
);

const PETDEX_IDLE_FRAMES = petFrames(0, 6);
const PETDEX_WAVE_FRAMES = petFrames(3, 4);
const PETDEX_THINKING_FRAMES = petFrames(8, 6);
const PETDEX_ERROR_FRAMES = petFrames(5, 8);
const PETDEX_RUN_RIGHT_FRAMES = petFrames(1, 8);
const PETDEX_RUN_LEFT_FRAMES = petFrames(2, 8);

export function getPetdexMetrics(size: number): PetdexMetrics {
  const width = size;
  const height = Math.round(size * PETDEX_FRAME_HEIGHT_RATIO);
  return {
    width,
    height,
    sheetWidth: width * PETDEX_SHEET_COLUMNS,
    sheetHeight: height * PETDEX_SHEET_ROWS,
  };
}

export function getPetdexFrames(state: PetdexAnimationState): PetdexFrame[] {
  if (state.errorActive) {
    return PETDEX_ERROR_FRAMES;
  }
  if (state.direction === 'right') {
    return PETDEX_RUN_RIGHT_FRAMES;
  }
  if (state.direction === 'left') {
    return PETDEX_RUN_LEFT_FRAMES;
  }
  if (state.thinking) {
    return PETDEX_THINKING_FRAMES;
  }
  if (state.hovering) {
    return PETDEX_WAVE_FRAMES;
  }
  return PETDEX_IDLE_FRAMES;
}

export function getPetdexFrame(
  state: PetdexAnimationState,
  frameIndex: number,
): PetdexFrame {
  const frames = getPetdexFrames(state);
  return frames[frameIndex % frames.length];
}
