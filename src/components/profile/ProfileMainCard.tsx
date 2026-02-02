// src/components/profile/ProfileMainCard.tsx
'use client';

import Image from 'next/image';
import * as React from 'react';

import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileInfoRow } from '@/components/profile/ProfileInfoRow';
import { Button } from '@/components/ui/button';
import type { AuthUser } from '@/types/auth';

type ProfileMainCardProps = {
  user: AuthUser;
};

export const ProfileMainCard = ({ user }: ProfileMainCardProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <section className='w-full'>
      <h1 className='mb-4 text-2xl font-semibold text-foreground'>Profile</h1>

      <div className='w-full rounded-2xl bg-white p-6 shadow-sm'>
        {!isEditing ? (
          <>
            <div className='grid grid-cols-[56px_1fr] items-start gap-4'>
              <div className='relative h-14 w-14 overflow-hidden rounded-full bg-muted'>
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt='User avatar'
                    fill
                    sizes='56px'
                    className='object-cover'
                  />
                ) : null}
              </div>

              <div className='min-w-0'>
                <ProfileInfoRow label='Name' value={user.name} />
                <div className='h-px w-full bg-muted' />
                <ProfileInfoRow label='Email' value={user.email} />
                <div className='h-px w-full bg-muted' />
                <ProfileInfoRow label='Nomor Handphone' value={user.phone} />
              </div>
            </div>

            <Button
              type='button'
              className='mt-6 h-12 w-full rounded-full text-sm font-semibold'
              onClick={() => setIsEditing(true)}
            >
              Update Profile
            </Button>
          </>
        ) : (
          <ProfileForm
            user={user}
            onCancelAction={() => setIsEditing(false)}
            onSuccessAction={() => setIsEditing(false)}
          />
        )}
      </div>
    </section>
  );
};
