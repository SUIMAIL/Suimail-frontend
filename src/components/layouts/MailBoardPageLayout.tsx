import { EmailListProvider } from '../EmailViewComponents/EmailListContext'

interface MailBoardPageLayoutProps {
  children: React.ReactNode
}

const MailBoardPageLayout = ({ children }: MailBoardPageLayoutProps) => {
  return (
    <EmailListProvider>
      <div className="w-full p-4">{children}</div>
    </EmailListProvider>
  )
}

export default MailBoardPageLayout
