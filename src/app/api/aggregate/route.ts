import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionName } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON format" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Aggregation pipeline must be an array" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const collectionName = getCollectionName();

    // 1️⃣ Run aggregation ONCE
    const results = await db
      .collection(collectionName)
      .aggregate(body)
      .toArray();

    // 2️⃣ Run explain safely using db.command
    const explainResult = await db.command({
      explain: {
        aggregate: collectionName,
        pipeline: body,
        cursor: {},
      },
      verbosity: "executionStats",
    });

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        results,
        count: results.length,
      },
      metrics: {
        executionTime,
        operation: "aggregate",
        stagesExecuted: body.length,
        documentsReturned: results.length,
      },
      pipeline: body.map((stage, index) => ({
        stage: index + 1,
        operator: Object.keys(stage)[0],
        details: stage,
      })),
      explain: explainResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metrics: { executionTime: Date.now() - startTime },
      },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase, getCollectionName } from "@/lib/mongodb";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();

//   try {
//     const text = await request.text();
//     let body;
//     try {
//       body = JSON.parse(text);
//     } catch (error) {
//       return NextResponse.json(
//         { success: false, error: "Invalid JSON format" },
//         { status: 400 },
//       );
//     }

//     if (!Array.isArray(body)) {
//       return NextResponse.json(
//         { success: false, error: "Aggregation pipeline must be an array" },
//         { status: 400 },
//       );
//     }

//     const { db } = await connectToDatabase();
//     const collection = db.collection(getCollectionName());

//     const pipeline = collection.aggregate(body);
//     const explainResult = await pipeline.explain("executionStats");
//     const results = await pipeline.toArray();
//     const executionTime = Date.now() - startTime;

//     return NextResponse.json({
//       success: true,
//       data: {
//         results,
//         count: results.length,
//       },
//       metrics: {
//         executionTime,
//         operation: "aggregate",
//         stagesExecuted: body.length,
//         documentsReturned: results.length,
//       },
//       pipeline: body.map((stage, index) => ({
//         stage: index + 1,
//         operator: Object.keys(stage)[0],
//         details: stage,
//       })),
//     });
//   } catch (error) {
//     const executionTime = Date.now() - startTime;
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error",
//         metrics: { executionTime },
//       },
//       { status: 500 },
//     );
//   }
// }
