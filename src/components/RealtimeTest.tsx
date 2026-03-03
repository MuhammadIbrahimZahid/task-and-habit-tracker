'use client'; // important: this runs in the browser

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Props {
  userId: string;
}

export default function RealtimeTest({ userId }: Props) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const channelName = `tasks-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('✅ Realtime event:', payload);
          setEvents((prev) => [...prev, JSON.stringify(payload)]);
        },
      )
      .subscribe((status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED') setConnected(true);
      });

    return () => {
      console.log('Unsubscribing from test channel...');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div>
      <p>Realtime channel connected: {connected ? '✅' : '❌'}</p>
      <h4>Recent events:</h4>
      <ul>
        {events.slice(-5).map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
