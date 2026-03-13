// UI component: renders and manages the SearchBar feature block.
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { PROFESSIONS } from '../../utils/constants';

interface SearchBarProps {
  onSearch: (profession: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [selectedProfession, setSelectedProfession] = useState('');

  const handleSearch = () => {
    onSearch(selectedProfession);
  };

  return (
    <div className="space-y-3">
      <Select
        options={[
          { value: '', label: 'All Professions' },
          ...PROFESSIONS.map((p) => ({ value: p.value, label: p.label })),
        ]}
        value={selectedProfession}
        onChange={(e) => setSelectedProfession(e.target.value)}
        className="w-full"
        label=""
      />
      
      <Button
        onClick={handleSearch}
        variant="primary"
        className="w-full"
        leftIcon={<Search className="w-4 h-4" />}
      >
        Search
      </Button>
    </div>
  );
};
