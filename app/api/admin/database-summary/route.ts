import { NextRequest, NextResponse } from "next/server";
import { getDatabaseSummary, DatabaseSummaryQuerySchema } from "@/lib/database-summary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = DatabaseSummaryQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const summary = await getDatabaseSummary({ limit: queryValidation.data.limit });

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database summary endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve database summary metrics",
      },
      { status: 500 }
    );
  }
}
