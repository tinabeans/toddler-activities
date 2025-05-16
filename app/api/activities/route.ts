import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { 
  getActivities, 
  createActivity, 
  updateActivity,
  updateCompletionCount,
  deleteActivity
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
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
      HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
    };
    console.log('Environment check:', envCheck);

    // Log the current database role before attempting write
    let dbRoleInfo: any = null;
    try {
      const { rows: [roleInfo] } = await sql`SELECT current_user, current_database()`;
      dbRoleInfo = roleInfo;
      console.log('Current database connection info:', JSON.stringify(roleInfo));
    } catch (dbError) {
      console.error('Error checking database connection info:', dbError);
      console.error('Database connection error details:', dbError instanceof Error ? {
        message: dbError.message,
        stack: dbError.stack,
        name: dbError.name
      } : 'Unknown error');
      
      // Return the database connection error info in the response
      return NextResponse.json({
        error: 'Failed to check database connection',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        errorType: dbError instanceof Error ? dbError.name : 'UnknownErrorType',
        diagnostics: {
          environment: envCheck
        }
      }, { status: 500 });
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
    
    // Extract error properties
    const errorProps: Record<string, any> = {};
    try {
      Object.getOwnPropertyNames(error).forEach(prop => {
        try {
          // @ts-ignore
          errorProps[prop] = typeof error[prop] === 'function' ? '[Function]' : error[prop];
        } catch (e) {
          errorProps[prop] = '[Error accessing property]';
        }
      });
    } catch (e) {
      console.error('Error extracting error properties:', e);
    }
    
    console.error('Full error object properties:', JSON.stringify(Object.getOwnPropertyNames(error).reduce((acc: Record<string, any>, prop) => {
      try {
        // @ts-ignore
        acc[prop] = typeof error[prop] === 'function' ? '[Function]' : error[prop];
      } catch (e) {
        acc[prop] = '[Error accessing property]';
      }
      return acc;
    }, {})));
    
    // Return detailed diagnostics in the response itself
    return NextResponse.json(
      { 
        error: 'Failed to save activity', 
        details: errorMessage,
        errorType: errorName,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined,
        diagnostics: {
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
            HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
          },
          errorProperties: errorProps,
          pgErrorCode: (error as any)?.code,
          pgErrorDetail: (error as any)?.detail,
          pgErrorHint: (error as any)?.hint,
          pgErrorSeverity: (error as any)?.severity,
          timestamp: new Date().toISOString()
        }
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
    
    // Extract error properties
    const errorProps: Record<string, any> = {};
    try {
      Object.getOwnPropertyNames(error).forEach(prop => {
        try {
          // @ts-ignore
          errorProps[prop] = typeof error[prop] === 'function' ? '[Function]' : error[prop];
        } catch (e) {
          errorProps[prop] = '[Error accessing property]';
        }
      });
    } catch (e) {
      console.error('Error extracting error properties:', e);
    }
    
    // Return detailed diagnostics in the response itself
    return NextResponse.json(
      { 
        error: 'Failed to update activity',
        details: errorMessage,
        errorType: errorName,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined,
        diagnostics: {
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
            HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
          },
          errorProperties: errorProps,
          pgErrorCode: (error as any)?.code,
          pgErrorDetail: (error as any)?.detail,
          pgErrorHint: (error as any)?.hint,
          pgErrorSeverity: (error as any)?.severity,
          timestamp: new Date().toISOString()
        }
      },
      { status }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/activities - Starting request processing');
    
    // Get the activity ID or title from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const title = url.searchParams.get('title');
    
    if (!id && !title) {
      console.log('Activity identifier (ID or title) is missing in delete request');
      return NextResponse.json(
        { error: 'Activity ID or title is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete activity with ${id ? 'ID: ' + id : 'title: ' + title}`);
    
    // Log environment variables (sanitized)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
      HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
    };
    console.log('Environment check:', envCheck);
    
    // Log database connection info before delete
    try {
      const { rows: [roleInfo] } = await sql`SELECT current_user, current_database()`;
      console.log('Current database connection info:', JSON.stringify(roleInfo));
    } catch (dbError) {
      console.error('Error checking database connection info:', dbError);
      return NextResponse.json({
        error: 'Failed to check database connection',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        diagnostics: { environment: envCheck }
      }, { status: 500 });
    }
    
    let result;
    
    if (id) {
      // Delete by ID
      result = await sql`
        DELETE FROM activities
        WHERE id = ${id}::integer
        RETURNING id
      `;
    } else if (title) {
      // Delete by title
      result = await sql`
        DELETE FROM activities
        WHERE title = ${title}
        RETURNING id
      `;
    }
    
    if (!result || result.rowCount === 0) {
      console.log(`Activity with ${id ? 'ID ' + id : 'title ' + title} not found`);
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    
    console.log(`Activity with ${id ? 'ID ' + id : 'title ' + title} deleted successfully`);
    return NextResponse.json({ 
      success: true, 
      identifier: id || title 
    });
    
  } catch (error) {
    console.error('Error deleting activity:', error);
    
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownErrorType';
    const errorStack = error instanceof Error ? error.stack : '';
    const status = errorMessage.includes('permission denied') ? 403 : 500;
    
    console.error('Detailed delete error information:');
    console.error('Error Type:', errorName);
    console.error('Status:', status);
    console.error('Message:', errorMessage);
    console.error('Stack:', errorStack);
    
    // Extract error properties
    const errorProps: Record<string, any> = {};
    try {
      Object.getOwnPropertyNames(error).forEach(prop => {
        try {
          // @ts-ignore
          errorProps[prop] = typeof error[prop] === 'function' ? '[Function]' : error[prop];
        } catch (e) {
          errorProps[prop] = '[Error accessing property]';
        }
      });
    } catch (e) {
      console.error('Error extracting error properties:', e);
    }
    
    // Return detailed diagnostics in the response itself
    return NextResponse.json(
      { 
        error: 'Failed to delete activity',
        details: errorMessage,
        errorType: errorName,
        hint: status === 403 ? 'Database write permission denied. Please check database permissions.' : undefined,
        diagnostics: {
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
            HAS_POSTGRES_USER: !!process.env.POSTGRES_USER,
          },
          errorProperties: errorProps,
          pgErrorCode: (error as any)?.code,
          pgErrorDetail: (error as any)?.detail,
          pgErrorHint: (error as any)?.hint,
          pgErrorSeverity: (error as any)?.severity,
          timestamp: new Date().toISOString()
        }
      },
      { status }
    );
  }
} 