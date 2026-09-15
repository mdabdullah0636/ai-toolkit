import './globals.css';

export const metadata = {
  title: 'AI TOOLKIT - Next.js OpenAI Examples',
  description: 'Examples of using the AI TOOLKIT with Next.js and OpenAI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
