import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import { Investor } from '../../types';
import { Input } from '../../components/ui/Input';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvestors = async () => {
      try {
        const { data } = await api.get<Investor[]>('/users?role=investor');
        setInvestors(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestors();
  }, []);

  const stages = useMemo(
    () => Array.from(new Set(investors.flatMap((investor) => investor.investmentStage || []))),
    [investors]
  );

  const filteredInvestors = investors.filter((investor) => {
    const text = `${investor.name} ${investor.bio} ${(investor.investmentInterests || []).join(' ')}`.toLowerCase();
    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
    const matchesStage = !selectedStage || (investor.investmentStage || []).includes(selectedStage);
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Browse real investor profiles from the connected backend.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <button
              onClick={() => setSelectedStage('')}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${!selectedStage ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              All stages
            </button>
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedStage === stage ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {stage}
              </button>
            ))}
          </CardBody>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name, bio, or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            <Badge variant="gray">{filteredInvestors.length} results</Badge>
          </div>

          {isLoading ? (
            <Card>
              <CardBody>Loading investors...</CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInvestors.map((investor) => (
                <InvestorCard key={investor.id} investor={investor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
