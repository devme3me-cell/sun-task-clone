import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Mission = {
  id: string;
  title: string;
  type: "聊天任務" | "跟牌任務" | "馬逼任務" | "其他任務";
  desc: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Submission = {
  id: string;
  username: string;
  mission_id: string;
  mission_title: string;
  mission_type: string;
  photos: string[];
  photos_count: number;
  week: number;
  year: number;
  created_at: string;
};
