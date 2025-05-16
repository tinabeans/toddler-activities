import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function testConnection() {
  try {
    // Test basic connection
    console.log('Testing database connection...');
    await sql`SELECT 1`;
    console.log('✅ Database connection successful!');

    // Count activities
    const { rows: [count] } = await sql`SELECT COUNT(*) FROM activities`;
    console.log(`✅ Found ${count.count} activities in the database`);

    // Get sample activities
    console.log('\nSample activities by category:');
    const { rows: activities } = await sql`
      SELECT category, COUNT(*) as count 
      FROM activities 
      GROUP BY category
      ORDER BY category;
    `;
    
    activities.forEach(({ category, count }) => {
      console.log(`- ${category}: ${count} activities`);
    });

    // Get a random activity
    const { rows: [randomActivity] } = await sql`
      SELECT * FROM activities 
      ORDER BY RANDOM() 
      LIMIT 1;
    `;
    
    console.log('\nRandom activity from database:');
    console.log('-----------------------------');
    console.log(`Category: ${randomActivity.category}`);
    console.log(`Title: ${randomActivity.title}`);
    console.log(`Description: ${randomActivity.description}`);
    console.log(`Completion Count: ${randomActivity.completion_count}`);

  } catch (error) {
    console.error('Error testing database:', error);
    process.exit(1);
  }
}

testConnection(); 