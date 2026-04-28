import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import api from '../../lib/api';
import { Investor } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get<Investor>(`/users/${id}`);
        setInvestor(data);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  if (isLoading) {
    return <Card><CardBody>Loading investor profile...</CardBody></Card>;
  }

  if (!investor || investor.role !== 'investor') {
    return <Card><CardBody>Investor profile not found.</CardBody></Card>;
  }

  const isCurrentUser = currentUser?.id === investor.id;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <Avatar src={investor.avatarUrl} alt={investor.name} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
              <p className="mt-1 flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                {investor.location || 'Remote'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(investor.investmentStage || []).map((stage) => (
                  <Badge key={stage} variant="secondary">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>

          {!isCurrentUser && (
            <Link to={`/chat/${investor.id}`}>
              <Button leftIcon={<MessageCircle size={18} />}>Message</Button>
            </Link>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-700">{investor.bio || 'No bio added yet.'}</p>
              <div>
                <h3 className="font-medium text-gray-900">Investment Interests</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(investor.investmentInterests || []).length > 0 ? (
                    (investor.investmentInterests || []).map((interest) => <Badge key={interest} variant="primary">{interest}</Badge>)
                  ) : (
                    <span className="text-sm text-gray-500">No interests listed.</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Portfolio Companies</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(investor.portfolioCompanies || []).length > 0 ? (
                    (investor.portfolioCompanies || []).map((company) => <Badge key={company} variant="gray">{company}</Badge>)
                  ) : (
                    <span className="text-sm text-gray-500">No portfolio companies added yet.</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Investment Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Investment Range</span>
              <div className="mt-1 flex items-center text-lg font-semibold text-gray-900">
                <DollarSign size={18} className="mr-1 text-primary-600" />
                {investor.minimumInvestment || 'Flexible'} - {investor.maximumInvestment || 'Flexible'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Investments</span>
              <p className="mt-1 text-lg font-semibold text-gray-900">{investor.totalInvestments || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Investment History</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(investor.investmentHistory || []).length > 0 ? (
                  (investor.investmentHistory || []).map((entry) => (
                    <Badge key={entry} variant="secondary">
                      <Briefcase size={14} className="mr-1" />
                      {entry}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No investment history added yet.</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
