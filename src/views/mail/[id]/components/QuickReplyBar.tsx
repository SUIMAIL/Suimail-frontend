import { Reply, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetUserProfileImageQuery } from '@/hooks/user'

interface QuickReplyBarProps {
  senderName: string
  onReply: () => void
}

export function QuickReplyBar({ senderName, onReply }: QuickReplyBarProps) {
  const { data: profileImageData, isPending: isLoadingProfileImage } =
    useGetUserProfileImageQuery()
  const profileImage = profileImageData?.imageUrl

  return (
    <div className="surface-light border-t border-border elevation-2">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center space-x-4">
          {isLoadingProfileImage ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : profileImage ? (
            <img
              src={profileImage}
              alt="Me"
              className="w-8 h-8 rounded-full object-cover border-2 border-border shadow-sm"
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full surface-base border border-border">
              <User className="size-5 text-muted-foreground" />
            </div>
          )}

          <div
            className="flex-1 rounded-lg border border-border px-4 py-3 surface-base hover:bg-accent cursor-pointer transition-colors elevation-1 hover:elevation-2"
            onClick={onReply}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Click here to reply to {senderName}...
              </span>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
