import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Editor } from '@tinymce/tinymce-react'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { ComposeFormData } from './FormSection'

interface FormFieldProps {
  label: string
  name: keyof ComposeFormData
  type?: string
  placeholder?: string
  error?: string | null
  required?: boolean
  register: UseFormRegister<ComposeFormData>
  setValue?: UseFormSetValue<ComposeFormData>
  watch?: UseFormWatch<ComposeFormData>
  rows?: number
  extendAction?: React.ReactNode
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  useRichEditor?: boolean
  disabled?: boolean
  readonly?: boolean
}

export const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required,
  register,
  setValue,
  watch,
  rows,
  extendAction,
  onBlur,
  useRichEditor = false,
  disabled,
  readonly,
}: FormFieldProps) => {
  const commonProps = {
    placeholder,
    ...register(name, {
      onBlur: e => {
        if (onBlur) {
          onBlur(e)
        }
      },
    }),
    required,
    disabled,
    readOnly: readonly,
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <div className="relative">
        {useRichEditor && type === 'textarea' ? (
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
                // Essential premium features
                'ai',
                'powerpaste',
                'advtable',
                'checklist',
                'formatpainter',
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
        ) : type === 'textarea' ? (
          <Textarea id={name} rows={rows} {...commonProps} />
        ) : (
          <Input id={name} type={type} {...commonProps} />
        )}
        {extendAction && extendAction}
      </div>
      {error && <span className="text-xs text-red-500/80">{error}</span>}
    </div>
  )
}
