import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function testWrite() {
  try {
    // First check current role and permissions
    const { rows: [roleInfo] } = await sql`SELECT current_user, current_database()`;
    console.log('\nCurrent connection info:');
    console.log(`Role: ${roleInfo.current_user}`);
    console.log(`Database: ${roleInfo.current_database}`);

    // Test insert
    const testActivity = {
      category: 'Test Category',
      title: 'Test Activity',
      description: 'Test Description',
      completion_count: 0
    };

    console.log('\nTesting database write...');
    const result = await sql`
      INSERT INTO activities (category, title, description, completion_count)
      VALUES (${testActivity.category}, ${testActivity.title}, ${testActivity.description}, ${testActivity.completion_count})
      RETURNING id;
    `;
    
    console.log('✅ Successfully wrote to database!');
    console.log(`Created test activity with ID: ${result.rows[0].id}`);
    
    // Clean up test data
    await sql`DELETE FROM activities WHERE id = ${result.rows[0].id}`;
    console.log('✅ Successfully cleaned up test data');
    
  } catch (error: any) {
    console.error('❌ Error testing database write:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

testWrite(); 