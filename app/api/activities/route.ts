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
    console.log('POST /api/activities - Starting request processing');
    const newActivity = await request.json() as Activity;
    
    console.log('Activity data received:', JSON.stringify(newActivity));
    
    // Validate required fields
    if (!newActivity.category || !newActivity.title || !newActivity.description) {
      console.log('Missing required fields in activity data');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log environment variables (sanitized)
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
      HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
    });

    // Log the current database role before attempting write
    try {
      const { rows: [roleInfo] } = await sql`SELECT current_user, current_database()`;
      console.log('Current database connection info:', JSON.stringify(roleInfo));
    } catch (dbError) {
      console.error('Error checking database connection info:', dbError);
      console.error('Database connection error details:', dbError instanceof Error ? {
        message: dbError.message,
        stack: dbError.stack,
        name: dbError.name
      } : 'Unknown error');
    }

    console.log('Attempting to create activity in database...');
    const activity = await createActivity(newActivity);
    console.log('Activity created successfully with ID:', activity.id);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error saving activity:', error);
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : '';
    const errorName = error instanceof Error ? error.name : 'UnknownErrorType';
    const status = errorMessage.includes('permission denied') ? 403 : 500;
    
    // Log detailed error information
    console.error('Detailed error information:');
    console.error('Error Type:', errorName);
    console.error('Status:', status);
    console.error('Message:', errorMessage);
    console.error('Stack:', errorDetails);
    
    // Log the full error object properties
    console.error('Full error object properties:', JSON.stringify(Object.getOwnPropertyNames(error).reduce((acc: Record<string, any>, prop) => {
      try {
        // @ts-ignore
        acc[prop] = typeof error[prop] === 'function' ? '[Function]' : error[prop];
      } catch (e) {
        acc[prop] = '[Error accessing property]';
      }
      return acc;
    }, {})));
    
    return NextResponse.json(
      { 
        error: 'Failed to save activity', 
        details: errorMessage,
        errorType: errorName,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined
      },
      { status }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/activities - Starting request processing');
    const updatedActivity = await request.json() as Activity & { completionCount?: number };
    const { id, completionCount, ...activityData } = updatedActivity;
    
    console.log('Update request for activity ID:', id, 'Data:', JSON.stringify(updatedActivity));
    
    if (id === undefined) {
      console.log('Activity ID is missing in update request');
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // If completionCount is provided, update that specifically
    if (completionCount !== undefined) {
      console.log(`Updating completion count for activity ${id} to ${completionCount}`);
      const activity = await updateCompletionCount(id, completionCount);
      if (!activity) {
        console.log(`Activity not found with ID: ${id}`);
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }
      console.log('Completion count updated successfully');
      return NextResponse.json(activity);
    }

    // Otherwise update the activity data
    console.log(`Updating activity data for ID ${id}`);
    const activity = await updateActivity(id, activityData);
    if (!activity) {
      console.log(`Activity not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    console.log('Activity updated successfully');
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownErrorType';
    const errorStack = error instanceof Error ? error.stack : '';
    const status = errorMessage.includes('permission denied') ? 403 : 500;
    
    console.error('Detailed update error information:');
    console.error('Error Type:', errorName);
    console.error('Status:', status);
    console.error('Message:', errorMessage);
    console.error('Stack:', errorStack);
    
    return NextResponse.json(
      { 
        error: 'Failed to update activity',
        details: errorMessage,
        errorType: errorName,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined
      },
      { status }
    );
  }
} 