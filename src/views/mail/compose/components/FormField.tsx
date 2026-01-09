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
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  useRichEditor?: boolean
  disabled?: boolean
  readonly?: boolean
  className?: string
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
  onChange,
  useRichEditor = false,
  disabled,
  readonly,
  className,
}: FormFieldProps) => {
  const registerProps = register(name, {
    onBlur: e => {
      if (onBlur) {
        onBlur(e)
      }
    },
  })

  const commonProps = {
    placeholder,
    ...registerProps,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      registerProps.onChange(e)
      onChange?.(e)
    },
    required,
    disabled,
    readOnly: readonly,
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-foreground font-medium">
        {label}
      </Label>

      <div className="relative">
        {useRichEditor && type === 'textarea' ? (
          <ComposeEditor
            name={name}
            setValue={setValue}
            watch={watch}
            rows={rows}
          />
        ) : type === 'textarea' ? (
          <Textarea
            id={name}
            rows={rows}
            {...commonProps}
            className={`surface-base border-border text-foreground placeholder:text-muted-foreground focus:ring-blue-base resize-none ${className ?? ''}`}
          />
        ) : (
          <Input
            id={name}
            type={type}
            {...commonProps}
            className={`surface-base border-border text-foreground placeholder:text-muted-foreground focus:ring-blue-base ${className ?? ''}`}
          />
        )}
        {extendAction && extendAction}
      </div>
      {error && (
        <span className="text-xs text-destructive flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
          {error}
        </span>
      )}
    </div>
  )
}
