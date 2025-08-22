import { useNavigate } from 'react-router-dom'
import { Loading } from '../Loading'
import { Button } from '../ui/button'

interface PageLayoutProps {
  loading?: boolean
  isError?: boolean
  retry?: () => void
  children: React.ReactNode
}

const PageLayout = ({
  loading = false,
  isError = false,
  retry = () => {},
  children,
}: PageLayoutProps) => {
  const navigate = useNavigate()

  if (loading) {
    return <Loading />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-[300px] opacity-90">
            <img
              src="/images/break-vector.png"
              alt="error-image"
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">Oh no!</h1>
            <p className="text-gray-500">Something went wrong</p>
          </div>
          <Button
            className="mt-5 bg-blue-500 hover:bg-blue-600"
            onClick={retry}
          >
            Retry
          </Button>
        </div>
        <Button className="mt-5" variant="link" onClick={() => navigate('/')}>
          Go to home
        </Button>
      </div>
    )
  }
  return <>{children}</>
}

export default PageLayout
