import { sql } from '@vercel/postgres';
import { Activity, ActivityWithStats } from '../types/activity';

export async function createActivitiesTable() {
  try {
    console.log('Attempting to create activities table if it does not exist');
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        completion_count INTEGER DEFAULT 0
      );
    `;
    console.log('Activities table created successfully');
  } catch (error) {
    console.error('Error creating activities table:', error);
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code, // PostgreSQL error code
      detail: (error as any)?.detail, // PostgreSQL error detail
      position: (error as any)?.position, // PostgreSQL error position
    });
    throw error;
  }
}

export async function getActivities(): Promise<ActivityWithStats[]> {
  try {
    console.log('Fetching all activities from database');
    const { rows } = await sql`
      SELECT 
        id::text, 
        category, 
        title, 
        description, 
        completion_count as "completionCount"
      FROM activities 
      ORDER BY category, title;
    `;
    console.log(`Retrieved ${rows.length} activities from database`);
    return rows.map(row => ({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description,
      completionCount: row.completionCount || 0
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      position: (error as any)?.position,
    });
    throw error;
  }
}

export async function createActivity(activity: Omit<Activity, 'id'>) {
  try {
    console.log('Starting createActivity with data:', {
      category: activity.category,
      title: activity.title,
      description: activity.description ? `${activity.description.substring(0, 20)}...` : 'undefined'
    });
    
    // Log connection info before insert
    try {
      const { rows: [connInfo] } = await sql`SELECT current_user, current_database(), pg_backend_pid()`;
      console.log('Database connection for INSERT:', JSON.stringify(connInfo));
    } catch (connError) {
      console.error('Failed to get connection info before INSERT:', connError);
    }
    
    console.log('Executing INSERT statement');
    const { rows } = await sql`
      INSERT INTO activities (category, title, description)
      VALUES (${activity.category}, ${activity.title}, ${activity.description})
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    
    console.log('Insert successful, returned data:', JSON.stringify(rows[0]));
    return rows[0];
  } catch (error) {
    console.error('Error creating activity in database:', error);
    // Log detailed PostgreSQL error information
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      hint: (error as any)?.hint,
      position: (error as any)?.position,
      table: (error as any)?.table,
      column: (error as any)?.column,
      severity: (error as any)?.severity,
      schema: (error as any)?.schema,
    });
    
    // Check for specific PostgreSQL error codes
    if ((error as any)?.code === '42501') {
      console.error('PERMISSION DENIED: This appears to be a PostgreSQL permission error (code 42501)');
    } else if ((error as any)?.code === '42P01') {
      console.error('TABLE MISSING: The "activities" table does not exist (code 42P01)');
    }
    
    throw error;
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
  try {
    console.log(`Updating activity with ID: ${id}, data:`, JSON.stringify(activity));
    const { rows } = await sql`
      UPDATE activities
      SET 
        category = COALESCE(${activity.category}, category),
        title = COALESCE(${activity.title}, title),
        description = COALESCE(${activity.description}, description)
      WHERE id = ${id}::integer
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    console.log('Update successful, returned data:', rows.length ? JSON.stringify(rows[0]) : 'No rows returned');
    return rows[0];
  } catch (error) {
    console.error('Error updating activity:', error);
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      position: (error as any)?.position,
    });
    throw error;
  }
}

export async function updateCompletionCount(id: string, count: number) {
  try {
    console.log(`Updating completion count for activity ID ${id} to ${count}`);
    const { rows } = await sql`
      UPDATE activities
      SET completion_count = ${count}
      WHERE id = ${id}::integer
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    console.log('Completion count update successful, returned data:', rows.length ? JSON.stringify(rows[0]) : 'No rows returned');
    return rows[0];
  } catch (error) {
    console.error('Error updating completion count:', error);
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      position: (error as any)?.position,
    });
    throw error;
  }
}

export async function deleteActivity(id: string) {
  try {
    console.log(`Deleting activity with ID: ${id}`);
    
    // First check if the activity exists
    const checkResult = await sql`
      SELECT id FROM activities WHERE id = ${id}::integer
    `;
    
    if (checkResult.rowCount === 0) {
      console.log(`Activity with ID ${id} not found`);
      return null;
    }
    
    // Delete the activity
    const { rowCount } = await sql`
      DELETE FROM activities
      WHERE id = ${id}::integer
      RETURNING id
    `;
    
    console.log(`Activity with ID ${id} deleted successfully, rowCount: ${rowCount}`);
    
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting activity with ID ${id}:`, error);
    console.error('SQL Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownErrorType',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      position: (error as any)?.position,
    });
    throw error;
  }
} 