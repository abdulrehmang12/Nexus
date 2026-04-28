import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Download, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../lib/api';
import { Meeting, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const buildIcsFile = (meeting: Meeting) => {
  const start = new Date(meeting.date);
  const end = new Date(start.getTime() + meeting.durationMinutes * 60000);
  const formatUtc = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nexus//Meeting Scheduler//EN',
    'BEGIN:VEVENT',
    `UID:${meeting.calendarEventId || meeting._id}@nexus.local`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${meeting.notes || 'Nexus meeting'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const MeetingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedView, setSelectedView] = useState<View>('month');
  const [form, setForm] = useState({
    title: '',
    date: '',
    guestId: '',
    durationMinutes: '60',
    notes: '',
  });

  const loadData = async () => {
    const [{ data: meetingData }, { data: userData }] = await Promise.all([
      api.get<Meeting[]>('/meetings'),
      api.get<User[]>('/users'),
    ]);
    setMeetings(meetingData);
    setUsers(userData.filter((user) => user.id !== currentUser?.id));
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const scheduleMeeting = async () => {
    await api.post('/meetings/schedule', {
      ...form,
      durationMinutes: Number(form.durationMinutes),
    });
    setForm({ title: '', date: '', guestId: '', durationMinutes: '60', notes: '' });
    await loadData();
  };

  const updateStatus = async (meetingId: string, status: 'accepted' | 'rejected') => {
    await api.put(`/meetings/${meetingId}/status`, { status });
    await loadData();
  };

  const calendarEvents = useMemo(
    () =>
      meetings.map((meeting) => {
        const start = new Date(meeting.date);
        return {
          title: `${meeting.title} (${meeting.status})`,
          start,
          end: new Date(start.getTime() + meeting.durationMinutes * 60000),
        };
      }),
    [meetings]
  );

  const downloadInvite = (meeting: Meeting) => {
    const blob = new Blob([buildIcsFile(meeting)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h1>
        <p className="text-gray-600">Schedule, review, and sync meetings through a real calendar view.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <Card className="xl:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Schedule Meeting</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <Input label="Date & time" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} fullWidth />
            <Input label="Duration (minutes)" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} fullWidth />
            <div>
              <label className="block text-sm font-medium text-gray-700">Guest</label>
              <select value={form.guestId} onChange={(e) => setForm({ ...form, guestId: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <Button leftIcon={<CalendarIcon size={18} />} fullWidth onClick={scheduleMeeting}>
              Schedule Meeting
            </Button>
          </CardBody>
        </Card>

        <div className="space-y-6 xl:col-span-3">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Calendar Sync View</h2>
              <div className="flex gap-2">
                {(['month', 'week', 'day', 'agenda'] as View[]).map((view) => (
                  <Button key={view} size="sm" variant={selectedView === view ? 'primary' : 'outline'} onClick={() => setSelectedView(view)}>
                    {view}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-[520px] overflow-hidden rounded-md border border-gray-200 bg-white p-2">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view={selectedView}
                  onView={(view) => setSelectedView(view)}
                />
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting._id}>
                <CardBody className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <Badge variant={meeting.status === 'accepted' ? 'success' : meeting.status === 'rejected' ? 'error' : 'secondary'}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(meeting.date).toLocaleString()} • {meeting.durationMinutes} minutes
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Host: {meeting.host?.name} • Guest: {meeting.guest?.name}
                    </p>
                    {meeting.notes && <p className="mt-2 text-sm text-gray-600">{meeting.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => updateStatus(meeting._id, 'accepted')}>
                      Accept
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus(meeting._id, 'rejected')}>
                      Reject
                    </Button>
                    <Button variant="outline" leftIcon={<Download size={18} />} onClick={() => downloadInvite(meeting)}>
                      Add to Calendar
                    </Button>
                    <Link to={meeting.roomLink}>
                      <Button leftIcon={<Video size={18} />}>Join Room</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
            {meetings.length === 0 && (
              <Card>
                <CardBody>No meetings scheduled yet.</CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
