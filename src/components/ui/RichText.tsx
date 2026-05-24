import React from 'react';

interface RichTextProps {
  text: string;
  theme?: 'blue' | 'violet';
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text, theme = 'violet', className = '' }) => {
  if (!text) return null;

  // Split by line breaks first
  const lines = text.split('\n');

  const linkColor = theme === 'blue'
    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
    : 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300';

  return (
    <span className={`block space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (line === '') {
          return <span key={lineIdx} className="block h-2" />;
        }

        // Inline parser
        const tokens: React.ReactNode[] = [];
        // Regex to capture markdown bold, italic, code, markdown link, and raw URL
        // Group 1: Markdown link [text](url)
        // Group 2: link text
        // Group 3: link url
        // Group 4: Raw URL
        // Group 5: Bold **text**
        // Group 6: bold content
        // Group 7: Italic *text*
        // Group 8: italic content
        // Group 9: Inline code `code`
        // Group 10: code content
        const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|((?:https?):\/\/[^\s/$.?#].[^\s<>]*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
          const matchIndex = match.index;
          
          // Add plain text before match
          if (matchIndex > lastIndex) {
            tokens.push(line.substring(lastIndex, matchIndex));
          }

          if (match[1]) {
            // Markdown link: match[2] is text, match[3] is url
            tokens.push(
              <a
                key={matchIndex}
                href={match[3]}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkColor} hover:underline break-all font-medium transition-colors`}
              >
                {match[2]}
              </a>
            );
          } else if (match[4]) {
            // Raw URL
            tokens.push(
              <a
                key={matchIndex}
                href={match[4]}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkColor} hover:underline break-all font-medium transition-colors`}
              >
                {match[4]}
              </a>
            );
          } else if (match[5]) {
            // Bold
            tokens.push(
              <strong key={matchIndex} className="font-bold text-gray-900 dark:text-gray-100">
                {match[6]}
              </strong>
            );
          } else if (match[7]) {
            // Italic
            tokens.push(
              <em key={matchIndex} className="italic text-gray-800 dark:text-gray-200">
                {match[8]}
              </em>
            );
          } else if (match[9]) {
            // Inline code
            tokens.push(
              <code key={matchIndex} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/80 font-mono text-sm text-pink-600 dark:text-pink-400 border border-gray-200/80 dark:border-gray-700/80">
                {match[10]}
              </code>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          tokens.push(line.substring(lastIndex));
        }

        return (
          <span key={lineIdx} className="block leading-relaxed break-words text-gray-700 dark:text-gray-300">
            {tokens.length === 0 ? ' ' : tokens}
          </span>
        );
      })}
    </span>
  );
};
