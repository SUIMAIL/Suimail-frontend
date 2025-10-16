import { useEffect, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import type { ComposeFormData } from './FormSection'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'

interface ComposeEditorProps {
  rows?: number
  name: keyof ComposeFormData
  placeholder?: string
  setValue?: UseFormSetValue<ComposeFormData>
  watch?: UseFormWatch<ComposeFormData>
}

export const ComposeEditor = ({
  rows,
  name,
  placeholder,
  setValue,
  watch,
}: ComposeEditorProps) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
      // Force re-render editor when theme changes
      setKey(prev => prev + 1)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <Editor
        key={key}
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        init={{
          height: rows ? rows * 24 : 300,
          menubar: false,
          plugins: [
            'anchor',
            'autolink',
            'charmap',
            'codesample',
            'emoticons',
            'link',
            'lists',
            'media',
            'searchreplace',
            'table',
            'visualblocks',
            'wordcount',
          ],
          toolbar:
            'undo redo | blocks fontsize | bold italic underline | link table | align | checklist numlist bullist | emoticons charmap | removeformat',

          // Dark mode support
          skin: isDarkMode ? 'oxide-dark' : 'oxide',
          content_css: isDarkMode ? 'dark' : 'default',

          // Custom styling following your design system
          content_style: `
            body {
              background-color: ${isDarkMode ? 'oklch(0.15 0.01 250)' : 'oklch(0.99 0 0)'};
              color: ${isDarkMode ? 'oklch(0.97 0 0)' : 'oklch(0.2 0 0)'};
              font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              padding: 12px;
            }
            
            /* Links using your blue system */
            a {
              color: ${isDarkMode ? 'oklch(0.65 0.18 250)' : 'oklch(0.6 0.2 250)'};
              text-decoration: underline;
            }
            
            a:hover {
              color: ${isDarkMode ? 'oklch(0.7 0.19 250)' : 'oklch(0.65 0.21 250)'};
            }
            
            /* Selection color */
            ::selection {
              background-color: ${isDarkMode ? 'oklch(0.55 0.2 250 / 0.3)' : 'oklch(0.6 0.2 250 / 0.2)'};
            }
            
            /* Blockquotes */
            blockquote {
              border-left: 3px solid ${isDarkMode ? 'oklch(0.55 0.2 250)' : 'oklch(0.6 0.2 250)'};
              padding-left: 12px;
              margin-left: 0;
              color: ${isDarkMode ? 'oklch(0.7 0 0)' : 'oklch(0.45 0 0)'};
            }
            
            /* Code blocks */
            code {
              background-color: ${isDarkMode ? 'oklch(0.18 0.01 250)' : 'oklch(0.97 0 0)'};
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              font-size: 13px;
            }
            
            pre {
              background-color: ${isDarkMode ? 'oklch(0.18 0.01 250)' : 'oklch(0.97 0 0)'};
              padding: 12px;
              border-radius: 8px;
              overflow-x: auto;
            }
            
            /* Tables */
            table {
              border-collapse: collapse;
              width: 100%;
            }
            
            table td, table th {
              border: 1px solid ${isDarkMode ? 'oklch(0.25 0.01 250)' : 'oklch(0.9 0 0)'};
              padding: 8px;
            }
            
            table th {
              background-color: ${isDarkMode ? 'oklch(0.18 0.01 250)' : 'oklch(0.94 0 0)'};
              font-weight: 600;
            }
          `,

          branding: false,
          promotion: false,
          placeholder: placeholder,

          setup: (editor: any) => {
            editor.on('blur', () => {
              const content = editor.getContent()
              if (setValue) {
                setValue(name, content)
              }
            })
          },
        }}
        value={watch ? watch('message') : ''}
        onEditorChange={content => {
          if (setValue) {
            setValue('message', content)
          }
        }}
      />
    </div>
  )
}
