import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import { Entrepreneur } from '../../types';
import { Input } from '../../components/ui/Input';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';

export const EntrepreneursPage: React.FC = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntrepreneurs = async () => {
      try {
        const { data } = await api.get<Entrepreneur[]>('/users?role=entrepreneur');
        setEntrepreneurs(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrepreneurs();
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(entrepreneurs.map((entrepreneur) => entrepreneur.industry).filter(Boolean) as string[])),
    [entrepreneurs]
  );

  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    const text = `${entrepreneur.name} ${entrepreneur.startupName || ''} ${entrepreneur.pitchSummary || ''} ${entrepreneur.industry || ''}`.toLowerCase();
    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
    const matchesIndustry = !selectedIndustry || entrepreneur.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Explore entrepreneur profiles backed by the live database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Industries</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <button
              onClick={() => setSelectedIndustry('')}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${!selectedIndustry ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              All industries
            </button>
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedIndustry === industry ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {industry}
              </button>
            ))}
          </CardBody>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search founders, startups, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            <Badge variant="gray">{filteredEntrepreneurs.length} results</Badge>
          </div>

          {isLoading ? (
            <Card>
              <CardBody>Loading startups...</CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntrepreneurs.map((entrepreneur) => (
                <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
