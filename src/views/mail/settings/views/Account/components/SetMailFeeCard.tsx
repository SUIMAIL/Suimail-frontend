import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

const formSchema = z.object({
  mailFee: z
    .number()
    .min(0, 'Mail fee must be at least 0')
    .max(0.1, 'Mail fee cannot exceed 0.1'),
})
type FormData = z.infer<typeof formSchema>

interface SetMailFeeCardProps {
  isPending: boolean
  userMailFee: number
  handleSetMailFee: (mailFee: number) => void
}

export function SetMailFeeCard({
  userMailFee,
  handleSetMailFee,
  isPending,
}: SetMailFeeCardProps) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mailFee: userMailFee,
    },
  })

  const onSubmit = (data: FormData) => {
    handleSetMailFee(data.mailFee)
  }

  const mailFee = watch('mailFee')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 sm:mt-8 lg:mt-10">
      <h2 className="font-semibold text-lg sm:text-xl text-foreground mb-4">
        Set SUI Amount Per Mail
      </h2>
      <Card className="max-w-md surface-light elevation-2 border-border">
        <CardHeader>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Choose how much SUI you want to charge per mail. You can set any
            value between 0 and 0.1 SUI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:gap-5">
          <Slider
            min={0}
            max={0.1}
            step={0.01}
            value={[mailFee]}
            onValueChange={([val]) =>
              setValue('mailFee', val, { shouldValidate: true })
            }
            className="w-full"
            id="mailFee"
          />
          <div className="flex items-center justify-between surface-dark elevation-1 rounded-lg p-3 sm:p-4 border border-border">
            <Label
              htmlFor="mailFee"
              className="text-sm sm:text-base font-medium text-muted-foreground"
            >
              Selected Amount
            </Label>
            <span className="font-semibold text-base sm:text-lg text-blue-base">
              {mailFee} SUI
            </span>
          </div>
          {errors.mailFee && (
            <p className="text-sm text-destructive">{errors.mailFee.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-base hover:bg-blue-dark text-white touch-target transition-all hover:shadow-hover"
            disabled={isPending}
          >
            {isPending ? 'Updating...' : 'Done'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
