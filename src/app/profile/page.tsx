// src/app/profile/page.tsx
'use client';

import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { useProfileQuery } from '@/services/queries/auth';

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfileQuery();

  const user = profile?.data;

  if (isLoading) {
    return (
      <div className='mx-auto w-full max-w-360 px-6 md:px-10 lg:px-16 xl:px-30 pt-12'>
        <div className='rounded-2xl bg-white p-6 shadow-sm'>Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className='mx-auto w-full max-w-360 px-6 md:px-10 lg:px-16 xl:px-30 pt-12'>
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          Failed to load profile.
        </div>
      </div>
    );
  }

  return <ProfileLayout user={user} />;
}
