import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
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
      { error: 'Failed to get activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newActivity = await request.json() as Activity;
    
    // Validate required fields
    if (!newActivity.category || !newActivity.title || !newActivity.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the current database role before attempting write
    const { rows: [roleInfo] } = await sql`SELECT current_user, current_database()`;
    console.log('Current database connection info:', roleInfo);

    const activity = await createActivity(newActivity);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error saving activity:', error);
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : '';
    const status = errorMessage.includes('permission denied') ? 403 : 500;
    
    // Log detailed error information
    console.error('Detailed error information:');
    console.error('Status:', status);
    console.error('Message:', errorMessage);
    console.error('Stack:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to save activity', 
        details: errorMessage,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined
      },
      { status }
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
      if (!activity) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(activity);
    }

    // Otherwise update the activity data
    const activity = await updateActivity(id, activityData);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = errorMessage.includes('permission denied') ? 403 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to update activity',
        details: errorMessage,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined
      },
      { status }
    );
  }
} 