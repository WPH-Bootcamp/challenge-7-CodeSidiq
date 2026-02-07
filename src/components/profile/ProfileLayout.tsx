// src/components/profile/ProfileLayout.tsx
import { ProfileMainCard } from '@/components/profile/ProfileMainCard';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import type { AuthUser } from '@/types/auth';

type ProfileLayoutProps = {
  user: AuthUser;
};

export const ProfileLayout = ({ user }: ProfileLayoutProps) => {
  return (
    <div className='w-full bg-background'>
      <div className='mx-auto w-full max-w-360 px-6 md:px-10 lg:px-16 xl:px-30'>
        <div className='pt-8 lg:pt-12'>
          <div className='grid gap-6 lg:gap-8 lg:grid-cols-[240px_524px_1fr] lg:items-start'>
            <div className='hidden lg:block'>
              <ProfileSidebar user={user} />
            </div>

            <ProfileMainCard user={user} />

            <div className='hidden lg:block' aria-hidden='true' />
          </div>

          <div className='h-16' />
        </div>
      </div>
    </div>
  );
};
