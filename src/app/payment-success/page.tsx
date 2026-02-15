// src/app/payment-success/page.tsx
import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export const dynamic = 'force-dynamic';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
