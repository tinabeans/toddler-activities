import { NextResponse } from 'next/server';
import { 
  getActivities, 
  createActivity, 
  updateActivity,
  updateCompletionCount
} from '../../lib/db';
import { Activity } from '../../types/activity';

export async function GET() {
  try {
    const activities = await getActivities();
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
    const newActivity = await request.json() as Activity;
    const activity = await createActivity(newActivity);
    return NextResponse.json(activity, { status: 201 });
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
    const updatedActivity = await request.json() as Activity & { completionCount?: number };
    const { id, completionCount, ...activityData } = updatedActivity;
    
    if (id === undefined) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // If completionCount is provided, update that specifically
    if (completionCount !== undefined) {
      const activity = await updateCompletionCount(id, completionCount);
      return NextResponse.json(activity);
    }

    // Otherwise update the activity data
    const activity = await updateActivity(id, activityData);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 