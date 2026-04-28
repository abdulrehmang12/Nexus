import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Calendar, DollarSign, MapPin, MessageCircle, Users } from 'lucide-react';
import api from '../../lib/api';
import { Entrepreneur } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get<Entrepreneur>(`/users/${id}`);
        setEntrepreneur(data);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  if (isLoading) {
    return <Card><CardBody>Loading entrepreneur profile...</CardBody></Card>;
  }

  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return <Card><CardBody>Entrepreneur profile not found.</CardBody></Card>;
  }

  const isCurrentUser = currentUser?.id === entrepreneur.id;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="mt-1 flex items-center text-gray-600">
                <Building2 size={16} className="mr-2" />
                {entrepreneur.startupName || 'Startup founder'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="primary">{entrepreneur.industry || 'General'}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location || 'Remote'}
                </Badge>
                <Badge variant="accent">
                  <Calendar size={14} className="mr-1" />
                  Founded {entrepreneur.foundedYear || 'TBD'}
                </Badge>
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize || 1} team members
                </Badge>
              </div>
            </div>
          </div>

          {!isCurrentUser && (
            <Link to={`/chat/${entrepreneur.id}`}>
              <Button leftIcon={<MessageCircle size={18} />}>Message</Button>
            </Link>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-700">{entrepreneur.bio || 'No bio added yet.'}</p>
              <div>
                <h3 className="font-medium text-gray-900">Pitch Summary</h3>
                <p className="mt-1 text-gray-700">{entrepreneur.pitchSummary || 'No pitch summary added yet.'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Startup History</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(entrepreneur.startupHistory || []).length > 0 ? (
                    (entrepreneur.startupHistory || []).map((entry) => <Badge key={entry} variant="gray">{entry}</Badge>)
                  ) : (
                    <span className="text-sm text-gray-500">No startup milestones added yet.</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Funding</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Funding Needed</span>
              <div className="mt-1 flex items-center text-lg font-semibold text-gray-900">
                <DollarSign size={18} className="mr-1 text-primary-600" />
                {entrepreneur.fundingNeeded || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Preferences</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(entrepreneur.preferences || []).length > 0 ? (
                  (entrepreneur.preferences || []).map((entry) => <Badge key={entry} variant="secondary">{entry}</Badge>)
                ) : (
                  <span className="text-sm text-gray-500">No preferences listed.</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
