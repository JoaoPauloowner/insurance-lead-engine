'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import LiveChatCockpit from '@/components/chat/LiveChatCockpit';

export default function ChatDashboardPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId') || undefined;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <LiveChatCockpit initialLeadId={leadId} />
    </div>
  );
}
