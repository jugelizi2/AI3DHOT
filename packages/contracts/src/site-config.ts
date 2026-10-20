// Configuration fields the engine reads from each edition's own site package.
interface ModelPresetOptions {
  service: string;
  model: string;
  apiKeyEnv: string;
  /** Extra request fields, e.g. switching reasoning off for short structured tasks. */
  extra?: Record<string, unknown>;
  /** Output tokens added to every call's own limit for a reasoning model, which reasons before it answers. */
  reasoningTokens?: number;
  jsonMode: boolean;
  vision?: boolean;
  /** Capability → primary model for which this preset is an evaluated backup. */
  fallbackFor?: Record<string, string>;
  /** The score step's call parameters with this model, instead of the step's own (editorial/analyze.ts). */
  scoreCall?: { temperature: number; maxTokens: number; timeoutMs: number };
}

/** SDK models have no OpenAI-compatible HTTP address. */
export type ModelPreset = ModelPresetOptions & (
  | { transport?: "openai"; baseUrlEnv: string }
  | { transport: "cursor-sdk"; baseUrlEnv?: never; extra?: never; reasoningTokens?: never }
);

/** The optional founder shown in the site's structured metadata. */
export interface Founder {
  name: string;
  alternateName?: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  sameAs?: string[];
}
