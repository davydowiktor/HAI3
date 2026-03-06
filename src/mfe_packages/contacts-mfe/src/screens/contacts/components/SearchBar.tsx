import React from 'react';
import { Input } from '../../../components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="mb-6">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
