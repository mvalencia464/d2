'use client';

import { Suspense } from 'react';
import Direct2AeroApp from '../useraccounts';

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <Direct2AeroApp />
    </Suspense>
  );
}

