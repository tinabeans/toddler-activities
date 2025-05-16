import { sql } from '@vercel/postgres';
import { Activity, ActivityWithStats } from '../types/activity';

export async function createActivitiesTable() {
  try {
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
    throw error;
  }
}

export async function getActivities(): Promise<ActivityWithStats[]> {
  try {
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
    return rows;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

export async function createActivity(activity: Omit<Activity, 'id'>) {
  try {
    const { rows } = await sql`
      INSERT INTO activities (category, title, description)
      VALUES (${activity.category}, ${activity.title}, ${activity.description})
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    return rows[0];
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
  try {
    const { rows } = await sql`
      UPDATE activities
      SET 
        category = COALESCE(${activity.category}, category),
        title = COALESCE(${activity.title}, title),
        description = COALESCE(${activity.description}, description)
      WHERE id = ${id}::integer
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    return rows[0];
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

export async function updateCompletionCount(id: string, count: number) {
  try {
    const { rows } = await sql`
      UPDATE activities
      SET completion_count = ${count}
      WHERE id = ${id}::integer
      RETURNING id::text, category, title, description, completion_count as "completionCount";
    `;
    return rows[0];
  } catch (error) {
    console.error('Error updating completion count:', error);
    throw error;
  }
} 