export interface User {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ApiTaskList {
    id: string;
    user_id: string;
    name: string;
    color: string;
    position: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ApiTask {
    id: string;
    user_id: string;
    list_id: string;
    sticker_id: string | null;
    title: string;
    description: string | null;
    due_date: string;
    completed: boolean;
    position: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface RegisterInput {
    email: string;
    password: string;
    display_name: string;
  }
  
  export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface UpdateTaskInput {
    list_id?: string;
    title?: string;
    description?: string | null;
    due_date?: string;
    completed?: boolean;
    position?: number;
  }