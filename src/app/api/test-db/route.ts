import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    // Test the connection using the improved connection function
    const { client, db } = await connectToDatabase();

    // Get list of databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();

    await client.close();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      databases: databases.databases.map((db) => db.name),
      totalDatabases: databases.databases.length,
    });
  } catch (error) {
    console.error("Error testing database connection:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to MongoDB",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
