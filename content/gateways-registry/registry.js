export const gateways = [
    {
        slug: 'vercel-ai-gateway',
        name: 'Vercel AI Gateway',
        developer: 'Vercel',
        description: 'Access models from OpenAI, Anthropic, Google, Meta, xAI, and more through a single interface. Built into the AI TOOLKIT with automatic authentication on Vercel, BYOK support, provider routing, fallbacks, and observability in your Vercel dashboard.',
        packageName: 'ai-toolkit',
        featured: true,
        tags: ['unified-access', 'routing', 'observability', 'byok'],
        apiKeyEnvName: 'AI_GATEWAY_API_KEY',
        installCommand: {
            pnpm: 'pnpm add ai',
            npm: 'npm install ai',
            yarn: 'yarn add ai',
            bun: 'bun add ai',
        },
        codeExample: `import { generateText, gateway } from 'ai-toolkit';

const { text } = await generateText({
  model: gateway('openai/gpt-5'),
  prompt: 'Hello world',
});

console.log(text);`,
        docsUrl: 'https://vercel.com/docs/ai-gateway',
        apiKeyUrl: 'https://vercel.com/docs/ai-gateway#using-your-own-key',
        websiteUrl: 'https://vercel.com/ai-gateway',
        npmUrl: 'https://www.npmjs.com/package/ai',
    },
    {
        slug: 'openrouter',
        name: 'OpenRouter',
        developer: 'OpenRouter',
        description: 'A unified API gateway with one API key for hundreds of models from Anthropic, Google, Meta, Mistral, and more. Transparent per-token pricing, enterprise-grade infrastructure with automatic failover, and immediate access to newly released models.',
        packageName: '@openrouter/ai-toolkit-provider',
        featured: true,
        tags: ['unified-access', 'routing', 'pay-as-you-go'],
        apiKeyEnvName: 'OPENROUTER_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @openrouter/ai-toolkit-provider',
            npm: 'npm install @openrouter/ai-toolkit-provider',
            yarn: 'yarn add @openrouter/ai-toolkit-provider',
            bun: 'bun add @openrouter/ai-toolkit-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createOpenRouter } from '@openrouter/ai-toolkit-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const { text } = await generateText({
  model: openrouter.chat('anthropic/claude-sonnet-4.5'),
  prompt: 'What is OpenRouter?',
});

console.log(text);`,
        docsUrl: 'https://openrouter.ai/docs',
        apiKeyUrl: 'https://openrouter.ai/keys',
        websiteUrl: 'https://openrouter.ai',
        npmUrl: 'https://www.npmjs.com/package/@openrouter/ai-toolkit-provider',
    },
    {
        slug: 'cloudflare-ai-gateway',
        name: 'Cloudflare AI Gateway',
        developer: 'Cloudflare',
        description: "Access models from OpenAI, Anthropic, DeepSeek, Google AI Studio, and more through Cloudflare's AI Gateway. Automatic fallback between models, response caching, retries, rate limiting, and native support for Cloudflare Workers AI bindings.",
        packageName: 'ai-gateway-provider',
        featured: true,
        tags: ['unified-access', 'caching', 'routing', 'workers'],
        apiKeyEnvName: 'CLOUDFLARE_API_KEY',
        installCommand: {
            pnpm: 'pnpm add ai-gateway-provider',
            npm: 'npm install ai-gateway-provider',
            yarn: 'yarn add ai-gateway-provider',
            bun: 'bun add ai-gateway-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createAiGateway } from 'ai-gateway-provider';
import { createOpenAI } from '@ai-toolkit/openai';

const aigateway = createAiGateway({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  gateway: 'my-gateway',
  apiKey: process.env.CLOUDFLARE_API_KEY,
});

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { text } = await generateText({
  model: aigateway([openai('gpt-4o-mini')]),
  prompt: 'Write a greeting.',
});

console.log(text);`,
        docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
        apiKeyUrl: 'https://dash.cloudflare.com/',
        websiteUrl: 'https://developers.cloudflare.com/ai-gateway/',
        npmUrl: 'https://www.npmjs.com/package/ai-gateway-provider',
    },
    {
        slug: 'portkey',
        name: 'Portkey',
        developer: 'Portkey',
        description: 'A production-ready AI gateway with interoperability across 250+ LLMs, full-stack observability and tracing, 50+ guardrails, semantic caching, and conditional request routing with fallbacks, load balancing, and automatic retries.',
        packageName: '@portkey-ai/vercel-provider',
        featured: true,
        tags: [
            'unified-access',
            'routing',
            'observability',
            'caching',
            'security',
            'guardrails',
        ],
        apiKeyEnvName: 'PORTKEY_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @portkey-ai/vercel-provider',
            npm: 'npm install @portkey-ai/vercel-provider',
            yarn: 'yarn add @portkey-ai/vercel-provider',
            bun: 'bun add @portkey-ai/vercel-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createPortkey } from '@portkey-ai/vercel-provider';

const portkey = createPortkey({
  apiKey: process.env.PORTKEY_API_KEY,
  config: {
    provider: 'openai',
    override_params: {
      model: 'gpt-4o',
    },
  },
});

const { text } = await generateText({
  model: portkey.chatModel(''),
  prompt: 'What is Portkey?',
});

console.log(text);`,
        docsUrl: 'https://docs.portkey.ai/docs/integrations/libraries/vercel',
        apiKeyUrl: 'https://app.portkey.ai',
        websiteUrl: 'https://portkey.ai',
        npmUrl: 'https://www.npmjs.com/package/@portkey-ai/vercel-provider',
    },
    {
        slug: 'langdb',
        name: 'LangDB',
        developer: 'LangDB',
        description: 'A high-performance enterprise AI gateway built in Rust that governs, secures, and optimizes AI traffic. OpenAI-compatible APIs, access to 250+ models, dynamic request routing, tracing, and cost optimization. Connect to multiple LLMs by changing just two lines of code.',
        packageName: '@langdb/vercel-provider',
        tags: [
            'unified-access',
            'routing',
            'observability',
            'enterprise',
            'self-hosted',
        ],
        apiKeyEnvName: 'LANGDB_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @langdb/vercel-provider',
            npm: 'npm install @langdb/vercel-provider',
            yarn: 'yarn add @langdb/vercel-provider',
            bun: 'bun add @langdb/vercel-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createLangDB } from '@langdb/vercel-provider';

const langdb = createLangDB({
  apiKey: process.env.LANGDB_API_KEY,
  projectId: 'your-project-id',
});

const { text } = await generateText({
  model: langdb('openai/gpt-4o-mini'),
  prompt: 'Write a Python function that sorts a list:',
});

console.log(text);`,
        docsUrl: 'https://docs.langdb.ai/',
        apiKeyUrl: 'https://app.langdb.ai',
        websiteUrl: 'https://langdb.ai',
        npmUrl: 'https://www.npmjs.com/package/@langdb/vercel-provider',
    },
    {
        slug: 'requesty',
        name: 'Requesty',
        developer: 'Requesty',
        description: 'A unified LLM gateway with access to over 300 models. 99.99% uptime SLA with intelligent failover and load balancing, prompt caching that cuts costs by up to 80%, prompt injection detection, and built-in real-time observability.',
        packageName: '@requesty/ai-toolkit',
        tags: [
            'unified-access',
            'routing',
            'observability',
            'enterprise',
            'security',
        ],
        apiKeyEnvName: 'REQUESTY_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @requesty/ai-toolkit',
            npm: 'npm install @requesty/ai-toolkit',
            yarn: 'yarn add @requesty/ai-toolkit',
            bun: 'bun add @requesty/ai-toolkit',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createRequesty } from '@requesty/ai-toolkit';

const requesty = createRequesty({
  apiKey: process.env.REQUESTY_API_KEY,
});

const { text } = await generateText({
  model: requesty('openai/gpt-4o'),
  prompt: 'What is Requesty?',
});

console.log(text);`,
        docsUrl: 'https://docs.requesty.ai',
        apiKeyUrl: 'https://app.requesty.ai/api-keys',
        websiteUrl: 'https://requesty.ai',
        npmUrl: 'https://www.npmjs.com/package/@requesty/ai-toolkit',
    },
    {
        slug: 'apertis',
        name: 'Apertis',
        developer: 'Apertis',
        description: 'A unified AI gateway providing access to 470+ models from OpenAI, Anthropic, Google, and more through a single API key with transparent pay-as-you-go pricing. OpenAI-compatible and enterprise ready with automatic failover.',
        packageName: '@apertis/ai-toolkit-provider',
        tags: ['unified-access', 'pay-as-you-go', 'enterprise', 'routing'],
        apiKeyEnvName: 'APERTIS_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @apertis/ai-toolkit-provider',
            npm: 'npm install @apertis/ai-toolkit-provider',
            yarn: 'yarn add @apertis/ai-toolkit-provider',
            bun: 'bun add @apertis/ai-toolkit-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { apertis } from '@apertis/ai-toolkit-provider';

const { text } = await generateText({
  model: apertis('gpt-5.2'),
  prompt: 'Explain quantum computing in simple terms.',
});

console.log(text);`,
        docsUrl: 'https://docs.apertis.ai',
        apiKeyUrl: 'https://apertis.ai/token',
        websiteUrl: 'https://apertis.ai',
        npmUrl: 'https://www.npmjs.com/package/@apertis/ai-toolkit-provider',
    },
    {
        slug: 'llamagate',
        name: 'LlamaGate',
        developer: 'LlamaGate',
        description: 'An OpenAI-compatible API gateway with access to 26+ open-source LLMs (Llama, Qwen, DeepSeek, Mistral) at competitive prices. Includes vision, reasoning, code, and embedding models with pay-as-you-go pricing from $0.02-$0.55 per 1M tokens.',
        packageName: '@llamagate/ai-toolkit-provider',
        tags: ['unified-access', 'open-source', 'pay-as-you-go'],
        apiKeyEnvName: 'LLAMAGATE_API_KEY',
        installCommand: {
            pnpm: 'pnpm add @llamagate/ai-toolkit-provider',
            npm: 'npm install @llamagate/ai-toolkit-provider',
            yarn: 'yarn add @llamagate/ai-toolkit-provider',
            bun: 'bun add @llamagate/ai-toolkit-provider',
        },
        codeExample: `import { generateText } from 'ai-toolkit';
import { createLlamaGate } from '@llamagate/ai-toolkit-provider';

const llamagate = createLlamaGate({
  apiKey: process.env.LLAMAGATE_API_KEY,
});

const { text } = await generateText({
  model: llamagate('llama-3.1-8b'),
  prompt: 'Explain quantum computing in simple terms.',
});

console.log(text);`,
        docsUrl: 'https://llamagate.dev/docs',
        apiKeyUrl: 'https://llamagate.dev/dashboard',
        websiteUrl: 'https://llamagate.dev',
        npmUrl: 'https://www.npmjs.com/package/@llamagate/ai-toolkit-provider',
    },
];
