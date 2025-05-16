'use client';

import { useState, useEffect } from 'react';
import { Activity } from './types/activity';
import StatsPanel from './components/StatsPanel';
import MenuBar from './components/MenuBar';
import { Barrio } from 'next/font/google';

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  'Moving and Grooving': { 
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    gradient: 'from-pink-500 to-rose-500'
  },
  'Fine Motor Fun': {
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    gradient: 'from-sky-500 to-blue-500'
  },
  'Quiet Time Adventures': {
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    gradient: 'from-violet-500 to-purple-500'
  },
  'Sensory Explorations (Dry)': {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    gradient: 'from-amber-500 to-orange-500'
  },
  'Imaginative Play': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    gradient: 'from-emerald-500 to-green-500'
  },
  'Problem Solving & Early Learning': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    gradient: 'from-indigo-500 to-blue-500'
  },
  'Outdoor (If Possible and Safe)': {
    bg: 'bg-lime-100',
    text: 'text-lime-800',
    gradient: 'from-lime-500 to-green-500'
  }
};

const barrio = Barrio({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadActivities = async () => {
    try {
      const response = await fetch('/activities.json');
      const activities = await response.json();
      setAllActivities(activities);
      return activities;
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('activityCompletions');
    if (saved) {
      setCompletionCounts(JSON.parse(saved));
    }
    loadActivities();
  }, []);

  const getRandomActivity = async () => {
    setIsLoading(true);
    try {
      const activities = allActivities.length > 0 ? allActivities : await loadActivities();
      const randomIndex = Math.floor(Math.random() * activities.length);
      setCurrentActivity(activities[randomIndex]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    setIsLoading(false);
  };

  const handleComplete = () => {
    if (currentActivity) {
      const newCounts = {
        ...completionCounts,
        [currentActivity.title]: (completionCounts[currentActivity.title] || 0) + 1
      };
      setCompletionCounts(newCounts);
      localStorage.setItem('activityCompletions', JSON.stringify(newCounts));
      
      // Trigger a refresh of the stats panel to show updated count
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleAddActivity = async (newActivity: Omit<Activity, 'id'>) => {
    try {
      // Add the new activity to the JSON file
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivity),
      });

      if (!response.ok) {
        throw new Error('Failed to save activity');
      }

      // Reload activities
      const activities = await loadActivities();
      
      // Maybe switch to the new activity
      const addedActivity = activities.find((a: Activity) => 
        a.title === newActivity.title && 
        a.category === newActivity.category
      );
      if (addedActivity) {
        setCurrentActivity(addedActivity);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again.');
    }
  };

  const handleEditActivity = async (editedActivity: Activity) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedActivity),
      });

      if (!response.ok) {
        throw new Error('Failed to update activity');
      }

      // Reload activities to get the updated list
      const activities = await loadActivities();
      
      // If this was the current activity, find and update it in the new list
      if (currentActivity && currentActivity.id === editedActivity.id) {
        const updatedActivity = activities.find((a: Activity) => a.id === editedActivity.id);
        if (updatedActivity) {
          setCurrentActivity(updatedActivity);
        }
      }

      // Trigger a refresh of the stats panel
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  };

  useEffect(() => {
    if (!currentActivity) {
      getRandomActivity();
    }
  }, []);

  const totalCompletions = Object.values(completionCounts).reduce((sum, count) => sum + count, 0);
  const categories = Object.keys(categoryColors);

  return (
    <>
      <MenuBar 
        onToggleStats={() => setIsStatsPanelOpen(!isStatsPanelOpen)} 
        onAddActivity={handleAddActivity}
        categories={categories}
        isStatsPanelOpen={isStatsPanelOpen}
      />
      <StatsPanel 
        isOpen={isStatsPanelOpen} 
        onClose={() => setIsStatsPanelOpen(false)}
        onEditActivity={handleEditActivity}
        refreshTrigger={refreshTrigger}
      />
      
      <main className="min-h-screen pt-24 px-8 pb-8 bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="max-w-2xl mx-auto">
          <h1 className={`text-5xl text-center mb-8 text-purple-600 ${barrio.className}`}>
            Toddler Fun Generator! 🎯
          </h1>
          {currentActivity && (
            <>
              <div className="bg-white p-8 rounded-2xl shadow-xl animate-fade-in mb-8">
                <div className="mb-4 flex justify-between items-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    categoryColors[currentActivity.category]?.bg || 'bg-gray-100'
                  } ${
                    categoryColors[currentActivity.category]?.text || 'text-gray-800'
                  }`}>
                    {currentActivity.category}
                  </span>
                  <div className="flex items-center gap-3">
                    {completionCounts[currentActivity.title] > 0 && (
                      <span className={`text-sm ${categoryColors[currentActivity.category]?.text || 'text-purple-400'} opacity-75`}>
                        Done {completionCounts[currentActivity.title]} {completionCounts[currentActivity.title] === 1 ? 'time' : 'times'}
                      </span>
                    )}
                    <button
                      onClick={handleComplete}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-xl bg-gradient-to-r ${categoryColors[currentActivity.category]?.gradient || 'from-green-500 to-emerald-500'} text-white font-bold hover:shadow-lg transform hover:scale-105 transition-all text-sm`}
                    >
                      We did it! 🚀
                    </button>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  {currentActivity.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {currentActivity.description}
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={getRandomActivity}
                  disabled={isLoading}
                  className="px-8 py-4 text-lg rounded-2xl border-4 transition-all font-bold text-purple-600 border-purple-600 hover:bg-purple-50 hover:scale-105 shadow-sm"
                >
                  Another one 🎲
                </button>
              </div>
            </>
          )}
          
          {totalCompletions > 0 && (
            <p className="text-center mt-6 text-purple-700">
              Total activities completed: {totalCompletions}
            </p>
          )}
        </div>
      </main>
    </>
  );
} 