import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET tasks error:", error.message);

    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        { message: "Task title must be between 1 and 200 characters" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({ title })
      .select()
      .single();

    if (error) {
      console.error("POST task error:", error.message);

      return NextResponse.json(
        { message: "Failed to create task" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const completed = body.completed;

    if (!id || typeof completed !== "boolean") {
      return NextResponse.json(
        { message: "Valid task ID and completion status are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("PATCH task error:", error.message);

      return NextResponse.json(
        { message: "Failed to update task" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { message: "Valid task ID is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("DELETE task error:", error.message);

      return NextResponse.json(
        { message: "Failed to delete task" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}
