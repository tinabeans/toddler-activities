import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Activity } from '../../types/activity';

export async function POST(request: Request) {
  try {
    const newActivity = await request.json();
    
    // Read the current activities
    const filePath = path.join(process.cwd(), 'public', 'activities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const activities: Activity[] = JSON.parse(fileContent);
    
    // Generate a new ID (simple increment)
    const maxId = Math.max(...activities.map(a => parseInt(a.id || '0')), 0);
    const activityWithId = {
      ...newActivity,
      id: (maxId + 1).toString()
    };
    
    // Add the new activity
    activities.push(activityWithId);
    
    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(activities, null, 2));
    
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
    const updatedActivity = await request.json();
    
    // Read the current activities
    const filePath = path.join(process.cwd(), 'public', 'activities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const activities: Activity[] = JSON.parse(fileContent);
    
    // Find and update the activity
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    
    activities[index] = updatedActivity;
    
    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(activities, null, 2));
    
    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 