export interface Task {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
    completed: boolean;
    list_id: string;
    sticker_id: string | null;
    position: number;
  }