import { useState } from 'react';
import { Activity } from '../types/activity';
import AddActivityModal from './AddActivityModal';

interface MenuBarProps {
  onToggleStats: () => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  categories: string[];
  isStatsPanelOpen: boolean;
}

export default function MenuBar({ onToggleStats, onAddActivity, categories, isStatsPanelOpen }: MenuBarProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={onToggleStats}
            className="flex items-center gap-1 sm:gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            aria-label={isStatsPanelOpen ? "Close Stats" : "Open Stats"}
          >
            <div className="relative w-6 h-6">
              {/* Hamburger/X icon with animation */}
              <div className={`absolute inset-0 w-6 h-6 flex flex-col justify-center transition-all duration-300 ${isStatsPanelOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-6 h-0.5 bg-current mb-1.5" />
                <div className="w-6 h-0.5 bg-current mb-1.5" />
                <div className="w-6 h-0.5 bg-current" />
              </div>
              <svg 
                className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isStatsPanelOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            <span className="font-medium text-sm sm:text-base">Activities</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddActivity}
        categories={categories}
      />
    </>
  );
} 