import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Users } from 'lucide-react';
import api from '../../lib/api';
import { Investor, Meeting } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: investorData }, { data: meetingData }] = await Promise.all([
        api.get<Investor[]>('/users?role=investor'),
        api.get<Meeting[]>('/meetings'),
      ]);
      setInvestors(investorData);
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
          <p className="text-gray-600">Your entrepreneur workspace is now connected to the backend.</p>
        </div>
        <Link to="/meetings">
          <Button leftIcon={<CalendarDays size={18} />}>Manage Meetings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><CardBody><div className="flex items-center gap-3"><Users className="text-primary-600" /><div><p className="text-sm text-gray-600">Available Investors</p><p className="text-2xl font-semibold text-gray-900">{investors.length}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><CalendarDays className="text-primary-600" /><div><p className="text-sm text-gray-600">Upcoming Meetings</p><p className="text-2xl font-semibold text-gray-900">{meetings.length}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-3"><FileText className="text-primary-600" /><div><p className="text-sm text-gray-600">Document Chamber</p><p className="text-2xl font-semibold text-gray-900">Live</p></div></div></CardBody></Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
          <Link to="/investors" className="text-sm font-medium text-primary-600">View all</Link>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {investors.slice(0, 3).map((investor) => (
              <InvestorCard key={investor.id} investor={investor} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
