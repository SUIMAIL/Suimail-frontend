import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { ComposeFormData } from './FormSection'
import { ComposeEditor } from './ComposeEditor'

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
          <ComposeEditor
            name={name}
            setValue={setValue}
            watch={watch}
            rows={rows}
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
