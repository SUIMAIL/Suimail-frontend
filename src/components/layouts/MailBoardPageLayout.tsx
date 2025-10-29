// Fix: declare tinymceScriptLoaded on window
declare global {
  interface Window {
    tinymceScriptLoaded?: boolean
  }
}
import { useEffect } from 'react'
import { EmailListProvider } from '../EmailViewComponents/EmailListContext'

interface MailBoardPageLayoutProps {
  children: React.ReactNode
}

const MailBoardPageLayout = ({ children }: MailBoardPageLayoutProps) => {
  useEffect(() => {
    // ✅ Preload TinyMCE once per session
    if (!window.tinymceScriptLoaded) {
      const script = document.createElement('script')
      script.src =
        'https://cdn.tiny.cloud/1/' +
        import.meta.env.VITE_TINYMCE_API_KEY +
        '/tinymce/6/tinymce.min.js'
      script.referrerPolicy = 'origin'
      script.onload = () => {
        window.tinymceScriptLoaded = true
      }
      document.body.appendChild(script)
    }
  }, [])

  return (
    <EmailListProvider>
      <div className="w-full p-4">{children}</div>
    </EmailListProvider>
  )
}

export default MailBoardPageLayout
