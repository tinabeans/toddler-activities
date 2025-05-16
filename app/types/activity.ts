export interface Activity {
  id?: string;
  category: string;
  title: string;
  description: string;
}

export interface ActivityWithStats extends Activity {
  completionCount: number;
} 