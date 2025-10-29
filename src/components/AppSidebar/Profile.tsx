import { useGetUserProfileImageQuery } from '@/hooks/user'
import { useMemo } from 'react'
import { Skeleton } from '../ui/skeleton'
import { User } from 'lucide-react'

interface ProfileProps {
  name: string
  email: string
}

export function Profile({ name, email }: ProfileProps) {
  const { data: profileImageData, isPending: isLoadingProfileImage } =
    useGetUserProfileImageQuery()

  const profileImage = useMemo(
    () => profileImageData?.imageUrl,
    [profileImageData]
  )

  if (isLoadingProfileImage) {
    return <Skeleton className="w-10 h-10 rounded-full" />
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors pointer-events-none select-none">
      <div className="relative">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
            <User className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
    </div>
  )
}
