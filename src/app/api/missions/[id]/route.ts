import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, type, desc, active, start_date, end_date } = body;

    const { data, error } = await supabase
      .from("missions")
      .update({
        title,
        type,
        desc,
        active,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ mission: data });
  } catch (error) {
    console.error("Error updating mission:", error);
    return NextResponse.json({ error: "Failed to update mission" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("missions").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting mission:", error);
    return NextResponse.json({ error: "Failed to delete mission" }, { status: 500 });
  }
}
