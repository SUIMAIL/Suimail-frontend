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

          // 🌙 Dark mode support
          skin: isDarkMode ? 'oxide-dark' : 'oxide',
          content_css: isDarkMode ? 'dark' : 'default',

          // Custom background/text colors
          content_style: `
            body {
              background-color: ${isDarkMode ? '#1f2937' : '#ffffff'};
              color: ${isDarkMode ? '#f9fafb' : '#111827'};
              font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              padding: 10px;
            }
            a { 
              color: ${isDarkMode ? '#60a5fa' : '#3b82f6'}; 
            }
            a:hover { 
              color: ${isDarkMode ? '#93c5fd' : '#2563eb'}; 
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
