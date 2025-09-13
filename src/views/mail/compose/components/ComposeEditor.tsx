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
  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      init={{
        height: rows ? rows * 24 : 300,
        menubar: false,
        plugins: [
          // Core editing features
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
          'undo redo | blocks fontsize | bold italic underline | link table | ai | align | checklist numlist bullist | emoticons charmap | removeformat',
        content_style:
          'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
        skin: 'oxide',
        content_css: 'default',
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
  )
}
