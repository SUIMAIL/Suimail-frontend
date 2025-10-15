import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Reply, Forward, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export const ReplySection = ({
  senderName,
  onQuickReply,
  onReply,
  isReplying,
  profileImage,
  isLoadingProfileImage,
}: {
  senderName: string
  onQuickReply: () => void
  onReply: () => void
  isReplying: boolean
  profileImage?: string
  isLoadingProfileImage?: boolean
}) => (
  <div className="bg-white border-t border-gray-200 shadow-lg">
    <div className="max-w-4xl mx-auto p-4 flex items-center space-x-4">
      {isLoadingProfileImage ? (
        <Skeleton className="w-8 h-8 rounded-full" />
      ) : profileImage ? (
        <img src={profileImage} className="w-8 h-8 rounded-full" alt="Me" />
      ) : (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <User className="size-5 text-muted-foreground" />
        </div>
      )}
      <div
        onClick={onQuickReply}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">
            Click here to reply to {senderName}...
          </span>
          <Reply className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="p-2"
              onClick={onReply}
              disabled={isReplying}
            >
              <Reply className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="p-2">
              <Forward className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
      </div>
    </div>
  </div>
)
