import parse from 'html-react-parser'
import { ExternalLink } from 'lucide-react'

// Enhanced email body formatter component that handles both HTML and plain text
export const EmailBodyFormatter = ({
  body,
  isQuoted = false,
}: {
  body: string
  isQuoted?: boolean
}) => {
  // Check if the content is HTML (contains HTML tags)
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(body)

  if (isHtmlContent) {
    // Use html-react-parser to safely render HTML content
    return (
      <div
        className={`max-w-none prose prose-sm ${isQuoted ? 'text-gray-600' : 'text-gray-900'}`}
        style={{
          // Override prose styles to match your design
          fontSize: '14px',
          lineHeight: '1.6',
          color: isQuoted ? '#6B7280' : '#111827',
        }}
      >
        {parse(body)}
      </div>
    )
  }

  // Original plain text formatting logic for backward compatibility
  const formatEmailBody = (text: string) => {
    // Split by paragraphs first
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    return paragraphs.map((paragraph, pIndex) => {
      // Handle each line within the paragraph
      const lines = paragraph.split('\n')

      return (
        <div
          key={pIndex}
          className={`mb-4 ${isQuoted ? 'text-gray-600' : 'text-gray-900'}`}
        >
          {lines.map((line, lIndex) => {
            // Check if line is a quote (starts with >)
            if (line.trim().startsWith('>')) {
              return (
                <div
                  key={lIndex}
                  className="border-l-3 border-gray-300 pl-3 ml-2 mb-2"
                >
                  <span className="text-gray-600 italic">
                    {formatTextWithLinks(line.replace(/^>\s*/, ''))}
                  </span>
                </div>
              )
            }

            // Check if line is a header (email signature style)
            if (line.match(/^(From|To|Subject|Date|Sent):\s/i)) {
              return (
                <div
                  key={lIndex}
                  className="text-sm text-gray-500 font-medium mb-1"
                >
                  {formatTextWithLinks(line)}
                </div>
              )
            }

            // Regular paragraph line
            return (
              <div
                key={lIndex}
                className={`leading-relaxed ${lIndex > 0 ? 'mt-1' : ''}`}
              >
                {formatTextWithLinks(line)}
              </div>
            )
          })}
        </div>
      )
    })
  }

  const formatTextWithLinks = (text: string) => {
    // Enhanced URL regex to catch more patterns
    const urlRegex =
      /(https?:\/\/[^\s<>"{}|\\^`[\]]+[^\s<>"{}|\\^`[\].,;:])|(\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b)/g

    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (!part) return null

      // Check if it's a URL
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
          >
            {part.length > 50 ? `${part.substring(0, 47)}...` : part}
            <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
          </a>
        )
      }

      // Check if it's an email
      if (part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {part}
          </a>
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  return <div className="max-w-none">{formatEmailBody(body)}</div>
}
