export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      daily_missions: {
        Row: {
          id: string
          user_id: string
          title: string
          priority: 'high' | 'medium' | 'low'
          status: 'not_started' | 'doing' | 'done'
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          priority?: 'high' | 'medium' | 'low'
          status?: 'not_started' | 'doing' | 'done'
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          priority?: 'high' | 'medium' | 'low'
          status?: 'not_started' | 'doing' | 'done'
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      non_negotiables: {
        Row: {
          id: string
          user_id: string
          name: string
          is_completed: boolean
          current_streak: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          is_completed?: boolean
          current_streak?: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_completed?: boolean
          current_streak?: number
          date?: string
          created_at?: string
        }
      }
      deep_work_sessions: {
        Row: {
          id: string
          user_id: string
          duration_seconds: number
          date: string
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          duration_seconds: number
          date?: string
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          duration_seconds?: number
          date?: string
          started_at?: string
          ended_at?: string | null
        }
      }
      daily_journals: {
        Row: {
          id: string
          user_id: string
          date: string
          achievements: string
          time_wasters: string
          hardest_part: string
          improvements: string
          energy_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          date?: string
          achievements?: string
          time_wasters?: string
          hardest_part?: string
          improvements?: string
          energy_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          achievements?: string
          time_wasters?: string
          hardest_part?: string
          improvements?: string
          energy_level?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      time_logs: {
        Row: {
          id: string
          user_id: string
          category: 'study' | 'coding' | 'entertainment' | 'sleep' | 'other'
          hours: number
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category: 'study' | 'coding' | 'entertainment' | 'sleep' | 'other'
          hours: number
          description?: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'study' | 'coding' | 'entertainment' | 'sleep' | 'other'
          hours?: number
          description?: string
          date?: string
          created_at?: string
        }
      }
      feedback_entries: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      user_daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          total_focus_minutes: number
          missions_completed: number
          habits_completed: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          date?: string
          total_focus_minutes?: number
          missions_completed?: number
          habits_completed?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_focus_minutes?: number
          missions_completed?: number
          habits_completed?: number
          created_at?: string
        }
      }
    }
  }
}
