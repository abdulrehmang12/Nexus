import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarDays, Users } from 'lucide-react';
import api from '../../lib/api';
import { Entrepreneur, Meeting } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: entrepreneurData }, { data: meetingData }] = await Promise.all([
        api.get<Entrepreneur[]>('/users?role=entrepreneur'),
        api.get<Meeting[]>('/meetings'),
      ]);
      setEntrepreneurs(entrepreneurData);
      setMeetings(meetingData);
    };

    loadData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Track founders, meetings, and transactions from the live platform.</p>
        </div>
        <Link to="/deals">
          <Button leftIcon={<Briefcase size={18} />}>Open Payments</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><CardBody><div className="flex items-center gap-3"><Users className="text-primary-600" /><div><p className="text-sm text-gray-600">Founder Profiles</p><p className="text-2xl font-semibold text-gray-900">{entrepreneurs.length}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><CalendarDays className="text-primary-600" /><div><p className="text-sm text-gray-600">Scheduled Meetings</p><p className="text-2xl font-semibold text-gray-900">{meetings.length}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><Briefcase className="text-primary-600" /><div><p className="text-sm text-gray-600">Submission Status</p><p className="text-2xl font-semibold text-gray-900">Integrated</p></div></div></CardBody></Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
          <Link to="/entrepreneurs" className="text-sm font-medium text-primary-600">View all</Link>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entrepreneurs.slice(0, 3).map((entrepreneur) => (
              <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
