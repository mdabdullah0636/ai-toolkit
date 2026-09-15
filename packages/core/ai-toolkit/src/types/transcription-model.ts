import {
  TranscriptionModelV2,
  TranscriptionModelV3,
} from '@ai-toolkit/provider';

/**
Transcription model that is used by the AI TOOLKIT.
  */
export type TranscriptionModel =
  | string
  | TranscriptionModelV3
  | TranscriptionModelV2;
