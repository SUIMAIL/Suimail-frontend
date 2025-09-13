import { useGetUserProfileImageQuery } from '@/hooks/user'
import { SubviewHeader } from '../../components/subview-header'
import { FormSection } from './components/FormSection'
import { PageLayout } from '@/components/layouts'
import { useMemo } from 'react'

export function MailAddressView() {
  const {
    data: profileImageData,
    isPending: isLoadingProfileImage,
    isError,
  } = useGetUserProfileImageQuery()

  const profileImage = useMemo(
    () => profileImageData?.imageUrl,
    [profileImageData]
  )

  return (
    <PageLayout loading={isLoadingProfileImage} isError={isError}>
      <SubviewHeader
        title="Mail Address Settings"
        description="Manage your name, description, and image."
      />

      <div className="mt-10">
        <FormSection activeUserProfileImage={profileImage} />
      </div>
    </PageLayout>
  )
}
