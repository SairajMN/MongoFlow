import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API endpoint is working correctly",
    timestamp: new Date().toISOString(),
    mongodb_uri: process.env.MONGODB_URI ? "Configured" : "Not configured",
    db_name: process.env.DB_NAME || "Not configured",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "POST request received successfully",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }
}
