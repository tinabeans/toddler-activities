import { useState, useEffect } from 'react';
import { Activity } from '../types/activity';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  onDelete?: () => void;
  activity: Activity;
  categories: string[];
}

export default function EditActivityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  activity, 
  categories 
}: EditActivityModalProps) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [category, setCategory] = useState(activity.category);

  useEffect(() => {
    // Update form when activity changes
    setTitle(activity.title);
    setDescription(activity.description);
    setCategory(activity.category);
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...activity,
      title,
      description,
      category
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-[95%] sm:w-full max-w-lg z-30">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit Activity
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none min-h-[100px]"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-3">
            {/* Delete button - only shown if onDelete is provided */}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-5 py-2 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-1 w-full sm:w-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-semibold w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold w-full sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
} 