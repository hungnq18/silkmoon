import { Fragment } from 'react';

const inlinePattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\)|https?:\/\/[^\s]+)/g;

function InlineContent({ text }) {
  return String(text || '').split(inlinePattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }

    const markdownLink = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    const href = markdownLink?.[2] || (part.startsWith('http') ? part : null);
    if (href) {
      return <a key={index} href={href} target={href.startsWith('/') ? undefined : '_blank'} rel={href.startsWith('/') ? undefined : 'noopener noreferrer'} className="font-medium underline underline-offset-2">{markdownLink?.[1] || part}</a>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

const normalizeMessage = (text) => String(text || '')
  .replace(/\r\n?/g, '\n')
  .replace(/[ \t]+(?=\d+\.\s+\*\*)/g, '\n')
  .replace(/[ \t]+(?=[•*-]\s+\*\*)/g, '\n')
  .trim();

export default function ChatMessageContent({ text }) {
  const lines = normalizeMessage(text).split('\n');
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(<ol key={`ordered-${index}`} className="list-decimal space-y-2 pl-5">{items.map((item, itemIndex) => <li key={itemIndex} className="pl-1"><InlineContent text={item} /></li>)}</ol>);
      continue;
    }

    if (/^[•*-]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[•*-]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[•*-]\s+/, ''));
        index += 1;
      }
      blocks.push(<ul key={`unordered-${index}`} className="list-disc space-y-2 pl-5">{items.map((item, itemIndex) => <li key={itemIndex} className="pl-1"><InlineContent text={item} /></li>)}</ul>);
      continue;
    }

    blocks.push(<p key={`paragraph-${index}`}><InlineContent text={line} /></p>);
    index += 1;
  }

  return <div className="space-y-2.5 whitespace-pre-wrap break-words leading-relaxed">{blocks}</div>;
}
