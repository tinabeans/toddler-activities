'use client';

import { Activity, ActivityWithStats } from '../types/activity';
import { useEffect, useState } from 'react';
import EditActivityModal from './EditActivityModal';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEditActivity: (activity: Activity) => void;
  refreshTrigger: number;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Moving and Grooving': { 
    bg: 'bg-pink-100',
    text: 'text-pink-800'
  },
  'Fine Motor Fun': {
    bg: 'bg-sky-100',
    text: 'text-sky-800'
  },
  'Quiet Time Adventures': {
    bg: 'bg-violet-100',
    text: 'text-violet-800'
  },
  'Sensory Explorations (Dry)': {
    bg: 'bg-amber-100',
    text: 'text-amber-800'
  },
  'Imaginative Play': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800'
  },
  'Problem Solving & Early Learning': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800'
  },
  'Outdoor (If Possible and Safe)': {
    bg: 'bg-lime-100',
    text: 'text-lime-800'
  }
};

export default function StatsPanel({ isOpen, onClose, onEditActivity, refreshTrigger }: StatsPanelProps) {
  const [activities, setActivities] = useState<ActivityWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/activities.json');
        const allActivities: Activity[] = await response.json();
        
        const completionData = localStorage.getItem('activityCompletions') || '{}';
        const completions = JSON.parse(completionData);
        
        // Get unique categories
        const uniqueCategories = ['All', ...new Set(allActivities.map(a => a.category))];
        setCategories(uniqueCategories);
        
        const activitiesWithStats = allActivities.map(activity => ({
          ...activity,
          completionCount: completions[activity.title] || 0
        }));

        activitiesWithStats.sort((a, b) => {
          if (b.completionCount !== a.completionCount) {
            return b.completionCount - a.completionCount;
          }
          return a.title.localeCompare(b.title);
        });

        setActivities(activitiesWithStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading stats:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadStats();
    }
  }, [isOpen, refreshTrigger]);

  const filteredActivities = selectedCategory === 'All'
    ? activities
    : activities.filter(activity => activity.category === selectedCategory);

  const totalCompletions = filteredActivities.reduce((sum, activity) => sum + activity.completionCount, 0);

  const handleEditSave = (editedActivity: Activity) => {
    onEditActivity(editedActivity);
    setEditingActivity(null);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                Activity Stats 📊
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-gray-700"
              >
                {categories.map(category => (
                  <option 
                    key={category} 
                    value={category}
                    className={category !== 'All' ? categoryColors[category]?.text : ''}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-purple-600">Loading stats...</div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="p-6 space-y-4">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.title}
                    className="bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                          categoryColors[activity.category]?.bg || 'bg-gray-100'
                        } ${
                          categoryColors[activity.category]?.text || 'text-gray-800'
                        }`}>
                          {activity.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800">
                          {activity.title}
                        </h3>
                      </div>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setEditingActivity(activity)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                          aria-label="Edit activity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <div className="text-right">
                          
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {activity.description}
                    </p>
                    <p className={`text-sm block opacity-75 mt-2 ${categoryColors[activity.category]?.text || 'text-purple-600'}`}>
                      {activity.completionCount} {activity.completionCount === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingActivity && (
        <EditActivityModal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          onSave={handleEditSave}
          activity={editingActivity}
          categories={categories.filter(cat => cat !== 'All')}
        />
      )}
    </>
  );
} 