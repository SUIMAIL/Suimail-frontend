import type { IEmailAttachment } from '@/types/generic'
import type React from 'react'

interface AttachmentProps {
  attachment: IEmailAttachment
}

export const UnknownAttachment = () => {
  return <div>UnknownAttachment</div>
}

export const ImageAttachment: React.FC<AttachmentProps> = ({ attachment }) => {
  if (
    attachment.fileType === 'image/png' ||
    attachment.fileType === 'image/jpeg' ||
    attachment.fileType === 'image/jpg' ||
    attachment.fileType === 'image/gif'
  ) {
    return (
      <img
        src={`data:${attachment.fileType};base64,${attachment.content}`}
        alt={attachment.fileName}
        className="h-[70px] w-[130px] object-cover rounded-md shadow"
      />
    )
  }

  return <UnknownAttachment />
}

export const PdfAttachment: React.FC<AttachmentProps> = ({ attachment }) => {
  if (attachment.fileType === 'application/pdf') {
    return <div>PdfAttachment Not Yet Supported</div>
  }

  return <UnknownAttachment />
}

export const VideoAttachment: React.FC<AttachmentProps> = ({ attachment }) => {
  if (
    attachment.fileType === 'image/mp4' ||
    attachment.fileType === 'image/webm' ||
    attachment.fileType === 'image/mkv'
  ) {
    return (
      <video
        src={`data:${attachment.fileType};base64,${attachment.content}`}
        className="h-auto max-w-[200px]"
        controls
      />
    )
  }

  return <UnknownAttachment />
}
