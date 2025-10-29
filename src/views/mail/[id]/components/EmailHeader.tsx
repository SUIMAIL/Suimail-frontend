import {
  ArrowLeft,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

export const EmailHeader = ({
  subject,
  threadLength,
  onBack,
  onDelete,
  onReply,
  isDeleting,
}: {
  subject: string
  threadLength: number
  onBack: () => void
  onDelete: () => void
  onReply: () => void
  isDeleting: boolean
}) => (
  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
    <div className="flex items-center">
      <Button
        variant="ghost"
        onClick={onBack}
        className="p-2 hover:bg-gray-100"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600" />
      </Button>
      <h1 className="text-xl font-medium text-gray-900 ml-2">{subject}</h1>
      {threadLength > 1 && (
        <span className="ml-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
          {threadLength} messages
        </span>
      )}
    </div>

    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" className="p-2 hover:bg-gray-100">
            <Archive className="h-4 w-4 text-gray-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Archive</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Trash2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={onReply}
            className="p-2 hover:bg-gray-100"
          >
            <Reply className="h-4 w-4 text-gray-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reply</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" className="p-2 hover:bg-gray-100">
            <Forward className="h-4 w-4 text-gray-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Forward</TooltipContent>
      </Tooltip>

      <Button size="icon" variant="ghost" className="p-2 hover:bg-gray-100">
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  </div>
)
//            </p>
