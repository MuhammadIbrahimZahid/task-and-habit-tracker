'use client';

import { useEffect, useState } from 'react';
import { fetchHabitEvents, toggleHabitEvent } from '@/lib/habits';
import type { HabitEvent } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, TrendingUp } from 'lucide-react';

type HabitTrackerProps = {
  habitId: string;
};

export default function HabitTracker({ habitId }: HabitTrackerProps) {
  const [events, setEvents] = useState<HabitEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHabitEvents(habitId);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching habit events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [habitId]);

  const handleToggleEvent = async (eventDate: string) => {
    try {
      await toggleHabitEvent(habitId, eventDate, 'Completed');
      setEvents((prev) =>
        prev.map((event) =>
          event.event_date === eventDate
            ? { ...event, note: 'Completed' }
            : event,
        ),
      );
    } catch (error) {
      console.error('Error toggling event:', error);
    }
  };

  const completedEvents = events.filter((event) => event.note === 'Completed');
  const completionRate =
    events.length > 0
      ? Math.round((completedEvents.length / events.length) * 100)
      : 0;

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              Habit Tracker
            </h3>
          </div>
          {events.length > 0 && (
            <Badge
              variant="outline"
              className={`${
                completionRate >= 80
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : completionRate >= 50
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {completionRate}% Complete
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-slate-500 mt-2 text-sm">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-medium text-slate-600 mb-1">
              No events logged yet
            </h4>
            <p className="text-slate-500 text-sm">
              Start tracking this habit to see your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {event.note && (
                      <p className="text-xs text-slate-500 mt-1">
                        Status: {event.note}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleEvent(event.event_date)}
                  variant={event.note ? 'outline' : 'default'}
                  size="sm"
                  className={
                    event.note
                      ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }
                >
                  {event.note ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
