import { Activity } from '../types/activity';

/**
 * Fetches activities from the database API
 */
export async function fetchActivities(): Promise<Activity[]> {
  console.log('Fetching activities from API...');
  
  try {
    // Add cache-busting and credentials to ensure fresh data and proper authentication
    const response = await fetch('/api/activities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      credentials: 'include', // Include cookies for authentication if needed
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} activities from API`);
    return data;
  } catch (error) {
    console.error('Error in fetchActivities:', error);
    
    // Try fallback to JSON file if API fails
    try {
      console.log('Falling back to JSON file...');
      const fallbackResponse = await fetch('/activities.json', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`JSON fallback failed: ${fallbackResponse.statusText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log(`Fetched ${fallbackData.length} activities from JSON file (fallback)`);
      return fallbackData;
    } catch (fallbackError) {
      console.error('Fallback to JSON file failed:', fallbackError);
      throw new Error(`API and fallback both failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Creates a new activity via the API
 */
export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  try {
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create activity');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

/**
 * Updates an existing activity via the API
 */
export async function updateActivity(activity: Activity): Promise<Activity> {
  try {
    const response = await fetch('/api/activities', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update activity');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

/**
 * Deletes an activity via the API
 */
export async function deleteActivity(id: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/activities?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete activity');
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
} 