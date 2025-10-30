import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("GET /api/missions called");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Fetched missions:", data?.length || 0);
    return NextResponse.json({ missions: data || [] });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json({
      error: "Failed to fetch missions",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/missions called");
    const body = await request.json();
    console.log("Request body:", body);
    const { title, type, desc, active, start_date, end_date } = body;

    const insertData = {
      title,
      type,
      desc,
      active: active ?? true,
      start_date: start_date || null,
      end_date: end_date || null,
    };
    console.log("Inserting:", insertData);

    const { data, error } = await supabase
      .from("missions")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Mission created:", data);
    return NextResponse.json({ mission: data });
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json({
      error: "Failed to create mission",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
