import { createMdxComponents } from '@vercel/geistdocs/mdx';
import { LogoIconVercel } from '@vercel/geistdocs/assets/logos';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ComponentType } from 'react';
import { ExampleLinks } from '@/components/docs/example-links';
import { IndexCards } from '@/components/docs/index-cards';
import { Check, Cross } from '@/components/docs/inline-icons';
import { InstallPackages } from '@/components/docs/install-packages';
import { InlinePrompt } from '@/components/docs/inline-prompt';
import { Browser } from '@/components/docs/browser';
import { BrowserIllustration } from '@/components/docs/browser-illustration';
import { ChatGeneration } from '@/components/docs/chat-generation';
import { ObjectGeneration } from '@/components/docs/object-generation';
import { TextGeneration } from '@/components/docs/text-generation';
import { WeatherCard } from '@/components/docs/weather-card';
import {
  CardPlayer,
  WeatherSearch,
} from '@/components/docs/generative-ui-preview';
import {
  Card,
  QuickstartFrameworkCards,
  Support,
} from '@/components/docs/marketing-cards';
import { Templates } from '@/components/docs/templates';
import {
  CommunityModelCards,
  OfficialModelCards,
} from '@/components/docs/model-cards';
import { MDXImage } from '@/components/docs/mdx-image';
import { ButtonLink, GithubLink } from '@/components/docs/misc';
import { Note } from '@/components/docs/note';
import { PropertiesTable } from '@/components/docs/properties-table';
import { PreviewSwitchProviders } from '@/components/docs/provider-preview';
import { Snippet } from '@/components/docs/snippet';
import { createStub } from '@/components/docs/stub';
import { Tab, Tabs } from '@/components/docs/tabs';

type LinkComponent = ComponentType<ComponentProps<'a'>>;

// Content-compat shim (non-native, to be removed as content is fixed).
// Only `Weather` is still referenced by content (19 usages); the remaining
// template-era stubs were dead code and have been removed. Native template
// has no stubs — prefer implementing a real component or fixing the MDX.
const stubNames = ['Weather'] as const;

const stubs = Object.fromEntries(
  stubNames.map(name => [name, createStub(name)]),
);

/**
 * Content-compat shim (non-native, to be removed as content is fixed).
 * Catch-all renderer for pseudo-type tags that surface in content prose
 * (e.g. `<Source>`, `<TextPart>` inside type descriptions). Native content
 * escapes these as code; until then render children unadorned so text stays
 * readable instead of throwing on unknown MDX tags.
 */
const PseudoTag = ({ children }: { children?: unknown }) => <>{children}</>;

const pseudoTagNames = [
  'AI',
  'Array',
  'AIMessageChunk',
  'BaseMessage',
  'BASE64',
  'CALL',
  'CHOICE',
  'COMPLETE',
  'ContentPart',
  'DataContent',
  'DeepPartial',
  'DoGenerateResult',
  'DoStreamResult',
  'ElicitResult',
  'ELEMENT',
  'EngineResponse',
  'GenerateContentResponse',
  'GenerateTextResult',
  'GeneratedFile',
  'GetPromptResult',
  'ImageModelResponseMetadata',
  'JSONValue',
  'LanguageModelRequestMetadata',
  'LanguageModelResponseMetadata',
  'LanguageModelUsage',
  'LanguageModelV3CallOptions',
  'LanguageModelV3TextPart',
  'LanguageModelV3ToolCall',
  'LanguageModelV3ToolResultPart',
  'LangChainAIMessageChunk',
  'LangChainStreamEvent',
  'ListPromptsResult',
  'ListResourceTemplatesResult',
  'ListResourcesResult',
  'ListResultsResult',
  'McpToolSet',
  'ModelMessage',
  'NAME',
  'OBJECT',
  'ObjectStreamPart',
  'PARTIAL',
  'PrepareStepResult',
  'ProviderMetadata',
  'RankingItem',
  'ReactNode',
  'ReadableStream',
  'ReadResourceResult',
  'ReasoningDetail',
  'ReasoningOutput',
  'ReasoningPart',
  'RESULT',
  'Response',
  'ResponseMessage',
  'Source',
  'SpeechModelResponseMetadata',
  'StepResult',
  'StopCondition',
  'StreamPart',
  'StreamTextResult',
  'StreamTextTransform',
  'SystemMessage',
  'SystemModelMessage',
  'T',
  'TextPart',
  'TextStreamPart',
  'TOOLNAME',
  'TOOLS',
  'ToolResultOutput',
  'ToolResultPart',
  'TranscriptionModelResponseMetadata',
  'TypedToolCall',
  'TypedToolResult',
  'UIMessage',
  'UIMessageChunk',
  'VALUE',
  'VideoModelResponseMetadata',
  'VideoModelV4OperationWebhook',
  'Warning',
  'YOUR',
] as const;

const pseudoTags = Object.fromEntries(
  pseudoTagNames.map(name => [name, PseudoTag]),
);

export const getMDXComponents = ({
  a,
}: {
  a?: MDXComponents['a'];
}): MDXComponents => {
  const Link = a as LinkComponent;

  return {
    ...createMdxComponents({ a: Link }),
    ...stubs,
    ...pseudoTags,
    Note,
    PropertiesTable,
    Check,
    Cross,
    InstallPackages,
    InlinePrompt,
    Browser,
    BrowserIllustration,
    ChatGeneration,
    ObjectGeneration,
    TextGeneration,
    WeatherCard,
    CardPlayer,
    WeatherSearch,
    Card,
    Templates,
    OfficialModelCards,
    CommunityModelCards,
    PreviewSwitchProviders,
    QuickstartFrameworkCards,
    Support,
    VercelIcon: LogoIconVercel,
    Snippet,
    Tabs,
    Tab,
    IndexCards,
    ExampleLinks,
    GithubLink,
    ButtonLink,
    MDXImage,
    Image: MDXImage,
  };
};
