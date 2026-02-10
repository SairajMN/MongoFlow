import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { dbName, collectionName, sampleData } = await request.json();

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { error: "Database name and collection name are required" },
        { status: 400 },
      );
    }

    // Connect to MongoDB using the improved connection function
    const { client, db } = await connectToDatabase();
    // Switch to the specified database
    const targetDb = client.db(dbName);

    // Create a sample document to trigger database and collection creation
    const defaultData = sampleData || {
      name: "Sample Document",
      description:
        "This is a sample document to create the database and collection",
      createdAt: new Date(),
      status: "active",
    };

    // Insert a sample document to create the database and collection
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(defaultData);

    // Get database stats to confirm creation
    const stats = await db.stats();

    await client.close();

    return NextResponse.json({
      success: true,
      message: `Database '${dbName}' and collection '${collectionName}' created successfully`,
      databaseName: dbName,
      collectionName: collectionName,
      sampleDocumentId: result.insertedId,
      databaseSize: stats.storageSize,
      documentCount: stats.counts?.documents || 0,
    });
  } catch (error) {
    console.error("Error creating database:", error);
    return NextResponse.json(
      {
        error: "Failed to create database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to create a new database",
    example: {
      method: "POST",
      endpoint: "/api/create-db",
      body: {
        dbName: "your_database_name",
        collectionName: "your_collection_name",
        sampleData: {
          name: "Sample Document",
          description: "Your sample data here",
        },
      },
    },
  });
}
