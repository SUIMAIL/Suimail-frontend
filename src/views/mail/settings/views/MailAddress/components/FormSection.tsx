import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/components/ui/toast'
import { useSetUserProfileImageMutation } from '@/hooks/user'
import { uploadToCloudinary } from '@/utils/cloudinary'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, User } from 'lucide-react'
import { useMemo, useState } from 'react'

export function FormSection({
  activeUserProfileImage,
}: {
  activeUserProfileImage: string | null
}) {
  const [isUploading, setIsUploading] = useState(false)

  const queryClient = useQueryClient()
  const [imageRef, setImageRef] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const { mutateAsync: setUserProfileImage } = useSetUserProfileImageMutation()

  const { setNotification } = useToastContext()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      if (file.size > 1024 * 1024) {
        setNotification({
          message: 'File too large',
          description: 'Please select an image smaller than 1MB',
          type: 'error',
        })
        return
      }

      setImageRef(URL.createObjectURL(file))
      setProfileImage(file)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage) {
      setNotification({
        message: 'No image selected',
        description: 'Please select an image to upload',
        type: 'error',
      })
      return
    }

    try {
      setIsUploading(true)
      const url = await uploadToCloudinary(profileImage)

      await setUserProfileImage(url).then(async () => {
        setNotification({
          message: 'Image uploaded successfully',
          description: 'Your profile image has been updated',
          type: 'success',
        })
        await queryClient.invalidateQueries({
          queryKey: ['user-profile-image'],
        })
        setImageRef(null)
        setProfileImage(null)
      })
    } catch {
      setNotification({
        message: 'Failed to upload image',
        description: 'Please try again',
        type: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const activeUserImage = useMemo(
    () => imageRef || activeUserProfileImage,
    [activeUserProfileImage, imageRef]
  )

  return (
    <form className="flex flex-col space-y-6">
      <div className="w-fit flex flex-col items-center space-y-4">
        <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
          {activeUserImage ? (
            <img
              src={activeUserImage}
              alt="Profile preview"
              className="object-cover"
            />
          ) : (
            <User className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col items-center">
          <Label
            htmlFor="profile-image"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Label>
          <Input
            id="profile-image"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {profileImage && (
            <Button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 mt-3"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>
      </div>

      {/* Divider and spacing before readonly input */}
      <hr className="my-8 border-muted" />

      <div className="w-fit space-y-2 mt-4">
        <Label htmlFor="subname">Subname</Label>
        <Input
          id="subname"
          type="text"
          value="johndoe@suimail"
          readOnly
          className="bg-muted text-muted-foreground focus-visible:ring-0"
        />
      </div>
    </form>
  )
}
