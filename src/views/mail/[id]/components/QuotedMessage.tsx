import { ChevronDown, ChevronRight, Star, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmailBodyFormatter } from '../email-format'
import RenderAttachments from './RenderAttachments'
import type { IEmail } from '@/types/generic'

import { Skeleton } from '@/components/ui/skeleton'
import { User } from 'lucide-react'

export const QuotedMessage = ({
  email,
  isExpanded,
  onToggle,
  profileImage,
  isLoadingProfileImage,
}: {
  email: IEmail
  isExpanded: boolean
  onToggle: () => void
  profileImage?: string
  isLoadingProfileImage?: boolean
}) => (
  <div className="border border-gray-200 rounded-lg mb-4 bg-gray-50">
    <div
      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        {isLoadingProfileImage ? (
          <Skeleton className="w-10 h-10 rounded-full" />
        ) : profileImage ? (
          <img
            src={profileImage}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            <User className="size-6 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {email.sender.suimailNs}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-1 ml-2">
        <Button
          size="icon"
          variant="ghost"
          className="p-1 h-6 w-6 rounded-full"
        >
          <Star className="h-3 w-3 text-gray-400" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="p-1 h-6 w-6 rounded-full"
        >
          <MoreVertical className="h-3 w-3 text-gray-400" />
        </Button>
      </div>
    </div>

    {isExpanded && (
      <div className="border-t border-gray-200 bg-white p-4">
        <EmailBodyFormatter body={email.body} isQuoted={true} />
        {email.attachments && email.attachments.length > 0 && (
          <RenderAttachments attachments={email.attachments} />
        )}
      </div>
    )}
  </div>
)
