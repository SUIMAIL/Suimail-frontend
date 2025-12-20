import parse from 'html-react-parser'
import { ExternalLink } from 'lucide-react'

export const EmailBodyFormatter = ({
  body,
  isQuoted = false,
}: {
  body?: string
  isQuoted?: boolean
}) => {
  if (!body) {
    return (
      <div
        className={`text-sm ${isQuoted ? 'text-muted-foreground' : 'text-foreground'}`}
      >
        <p className="italic text-muted-foreground">[No message content]</p>
      </div>
    )
  }

  const isHtmlContent = /<[a-z][\s\S]*>/i.test(body)

  if (isHtmlContent) {
    return (
      <div
        className={`max-w-none prose prose-sm ${
          isQuoted ? 'text-muted-foreground' : 'text-foreground'
        } prose-headings:text-foreground prose-p:text-foreground prose-a:text-blue-base prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-border prose-hr:border-border prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground`}
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {parse(body)}
      </div>
    )
  }

  const formatEmailBody = (text: string) => {
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n')

      return (
        <div
          key={pIndex}
          className={`mb-4 ${
            isQuoted ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {lines.map((line, lIndex) => {
            if (line.trim().startsWith('>')) {
              return (
                <div
                  key={lIndex}
                  className="border-l-2 border-border pl-3 ml-2 mb-2"
                >
                  <span className="text-muted-foreground italic">
                    {formatTextWithLinks(line.replace(/^>\s*/, ''))}
                  </span>
                </div>
              )
            }

            if (line.match(/^(From|To|Subject|Date|Sent):\s/i)) {
              return (
                <div
                  key={lIndex}
                  className="text-sm text-muted-foreground font-medium mb-1"
                >
                  {formatTextWithLinks(line)}
                </div>
              )
            }

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
    const urlRegex =
      /(https?:\/\/[^\s<>"{}|\\^`[\]]+[^\s<>"{}|\\^`[\].,;:])|(\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b)/g

    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (!part) return null

      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-base hover:text-blue-dark hover:underline inline-flex items-center transition-colors"
          >
            {part.length > 50 ? `${part.substring(0, 47)}...` : part}
            <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
          </a>
        )
      }

      if (part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-blue-base hover:text-blue-dark hover:underline transition-colors"
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
