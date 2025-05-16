import { sql } from '@vercel/postgres';
import { promises as fs } from 'fs';
import path from 'path';
import { createActivitiesTable } from '../app/lib/db';
import 'dotenv/config';

async function migrateActivities() {
  try {
    // Read existing activities from JSON file
    const filePath = path.join(process.cwd(), 'public', 'activities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const activities = JSON.parse(fileContent);

    // Create the table
    await createActivitiesTable();

    // Insert activities
    for (const activity of activities) {
      await sql`
        INSERT INTO activities (category, title, description, completion_count)
        VALUES (
          ${activity.category}, 
          ${activity.title}, 
          ${activity.description}, 
          ${activity.completionCount || 0}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    console.log('Activities migrated successfully!');
  } catch (error) {
    console.error('Error migrating activities:', error);
    process.exit(1);
  }
}

migrateActivities(); 