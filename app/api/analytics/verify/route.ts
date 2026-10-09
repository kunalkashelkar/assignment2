import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";

export async function GET() {
  try {
    await connectToDatabase();
    const count = await AnalyticsEvent.countDocuments();
    return NextResponse.json({
      success: true,
      message: "MongoDB connection and Mongoose model verified",
      totalAnalyticsEvents: count,
    });
  } catch (error: unknown) {
    console.error("MongoDB verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to MongoDB instance",
      },
      { status: 500 }
    );
  }
}
