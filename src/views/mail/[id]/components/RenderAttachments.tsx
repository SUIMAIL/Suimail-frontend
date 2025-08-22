import type { IEmailAttachment } from '@/types/generic'
import {
  ImageAttachment,
  PdfAttachment,
  UnknownAttachment,
  VideoAttachment,
} from './Attachments'
import { generateBase64Download } from '../utils/generate-base64-download'

interface RenderAttachmentsProps {
  attachments: IEmailAttachment[]
}

const RenderAttachments = ({ attachments }: RenderAttachmentsProps) => {
  const renderAttachment = (attachment: IEmailAttachment) => {
    switch (attachment.fileType) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/gif':
        return <ImageAttachment attachment={attachment} />
      case 'application/pdf':
        return <PdfAttachment attachment={attachment} />
      case 'image/mp4':
      case 'image/webm':
      case 'image/mkv':
        return <VideoAttachment attachment={attachment} />
      default:
        return <UnknownAttachment />
    }
  }

  const handleClick = async (attachment: IEmailAttachment) => {
    await generateBase64Download(attachment)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {attachments.map((attachment, index) => (
        <div key={index} className="flex flex-col items-center gap-y-2 ">
          <div
            onClick={() => handleClick(attachment)}
            className="group relative cursor-pointer hover:scale-105 transition-all duration-300"
          >
            {renderAttachment(attachment)}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-80 transition-all duration-300 rounded-md">
              <p className="text-white text-sm">Save File</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500">{attachment.fileName}</p>
        </div>
      ))}
    </div>
  )
}

export default RenderAttachments
