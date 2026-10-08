import { NextResponse } from "next/server";
import { getDatabaseSummary } from "@/lib/database-summary";

export async function GET() {
  try {
    const summary = await getDatabaseSummary();
    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database summary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve database summary metrics",
      },
      { status: 500 }
    );
  }
}
