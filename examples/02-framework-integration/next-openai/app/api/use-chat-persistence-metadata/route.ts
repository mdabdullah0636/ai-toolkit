import { openai } from '@ai-toolkit/openai';
import { saveChat } from '@util/chat-store';
import { convertToModelMessages, streamText, UIMessage } from 'ai-toolkit';

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === 'start') {
        return { createdAt: Date.now() };
      }
    },
    onFinish: ({ messages }) => {
      saveChat({ chatId, messages });
    },
  });
}
