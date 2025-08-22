import type { IEmailAttachment } from '@/types/generic'

export async function generateBase64Download(attachment: IEmailAttachment) {
  const file = `data:${attachment.fileType};base64,${attachment.content}`

  const res = await fetch(file)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = attachment.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
