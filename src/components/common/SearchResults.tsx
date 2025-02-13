// SearchResults.tsx
import React from 'react';
import { Project } from './NewProject';

interface SearchResultsProps {
  results: Project[];
  onSelect: (project: Project) => void;
  isVisible: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, isVisible }) => {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
      {results.map((project) => (
        <div
          key={project.id}
          className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          onClick={() => onSelect(project)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 truncate">{project.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults