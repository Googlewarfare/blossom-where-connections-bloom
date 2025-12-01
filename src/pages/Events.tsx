import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  category: string;
  max_attendees?: number;
  image_url?: string;
  attendee_count?: number;
  user_attending?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const fetchEvents = async () => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        *,
        event_attendees(count)
      `)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventsData && userData.user) {
      // Check which events user is attending
      const { data: attendingData } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', userData.user.id);

      const attendingIds = new Set(attendingData?.map(a => a.event_id));

      setEvents(eventsData.map(event => ({
        ...event,
        attendee_count: event.event_attendees?.[0]?.count || 0,
        user_attending: attendingIds.has(event.id)
      })) as any);
    }
  };

  const toggleAttendance = async (eventId: string, isAttending: boolean) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (isAttending) {
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userData.user.id);
      
      toast({ title: "You're no longer attending this event" });
    } else {
      await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: userData.user.id,
          status: 'interested'
        });
      
      toast({ title: "You're now attending this event!" });
    }

    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Local Singles Events</h1>
          <p className="text-muted-foreground">
            Meet new people at events near you
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {event.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {event.attendee_count} attending
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={event.user_attending ? "outline" : "default"}
                  onClick={() => toggleAttendance(event.id, event.user_attending || false)}
                >
                  {event.user_attending ? "Leave Event" : "Join Event"}
                </Button>
              </CardContent>
            </Card>
          ))}

          {events.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No upcoming events in your area
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
