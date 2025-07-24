import { CalendarEvent as CalendarEventType } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date-utils';

interface CalendarEventProps {
  event: CalendarEventType;
  onClick?: () => void;
}

export default function CalendarEvent({ event, onClick }: CalendarEventProps) {
  return (
    <Card
      className={cn(
        "p-2 mb-1 text-xs rounded-md cursor-pointer hover:opacity-80",
        "border-l-4 transition-all"
      )}
      style={{ 
        borderLeftColor: event.color,
        backgroundColor: `${event.color}20` // Add slight transparency
      }}
      onClick={onClick}
    >
      <div className="font-medium truncate">{event.title}</div>
      {(event.startTime || event.endTime) && (
        <div className="text-muted-foreground">
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
      )}
      {event.location && (
        <div className="truncate text-muted-foreground mt-0.5">
          📍 {event.location}
        </div>
      )}
    </Card>
  );
}