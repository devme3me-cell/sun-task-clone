import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: data || [] });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      mission_id,
      mission_title,
      mission_type,
      photos,
      photos_count,
      week,
      year,
    } = body;

    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          username,
          mission_id,
          mission_title,
          mission_type,
          photos: photos || [],
          photos_count: photos_count || 0,
          week,
          year,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ submission: data });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
