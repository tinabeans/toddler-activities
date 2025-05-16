import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Activity } from '../../types/activity';

// Helper function to read activities
async function readActivities(): Promise<Activity[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'activities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading activities:', error);
    return [];
  }
}

// Helper function to write activities (only in development)
async function writeActivities(activities: Activity[]): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    try {
      const filePath = path.join(process.cwd(), 'public', 'activities.json');
      await fs.writeFile(filePath, JSON.stringify(activities, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing activities:', error);
      return false;
    }
  }
  return false;
}

export async function GET() {
  try {
    const activities = await readActivities();
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error getting activities:', error);
    return NextResponse.json(
      { error: 'Failed to get activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Writing activities is only allowed in development mode' },
        { status: 403 }
      );
    }

    const newActivity = await request.json();
    const activities = await readActivities();
    
    // Generate a new ID (simple increment)
    const maxId = Math.max(...activities.map(a => parseInt(a.id || '0')), 0);
    const activityWithId = {
      ...newActivity,
      id: (maxId + 1).toString()
    };
    
    // Add the new activity
    activities.push(activityWithId);
    
    const success = await writeActivities(activities);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save activity' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(activityWithId, { status: 201 });
  } catch (error) {
    console.error('Error saving activity:', error);
    return NextResponse.json(
      { error: 'Failed to save activity' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Updating activities is only allowed in development mode' },
        { status: 403 }
      );
    }

    const updatedActivity = await request.json();
    const activities = await readActivities();
    
    // Find and update the activity
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    
    activities[index] = updatedActivity;
    
    const success = await writeActivities(activities);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update activity' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 