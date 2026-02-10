"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateDatabasePage() {
  const [dbName, setDbName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [sampleData, setSampleData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const dataToInsert = sampleData ? JSON.parse(sampleData) : undefined;

      const response = await fetch("/api/create-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbName,
          collectionName,
          sampleData: dataToInsert,
        }),
      });

      const resultData = await response.json();

      if (response.ok) {
        setResult(resultData);
      } else {
        setError(resultData.error || "Failed to create database");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New MongoDB Database</CardTitle>
          <CardDescription>
            This will create a new database and collection in your MongoDB Atlas
            cluster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <Input
                id="dbName"
                placeholder="e.g., my_new_database"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input
                id="collectionName"
                placeholder="e.g., users"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleData">Sample Data (JSON, optional)</Label>
              <Input
                id="sampleData"
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                value={sampleData}
                onChange={(e) => setSampleData(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Optional: Provide sample data to insert into the new collection
              </p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Database"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="mt-4">
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-semibold">Success!</h4>
                  <p>
                    <strong>Database:</strong> {result.databaseName}
                  </p>
                  <p>
                    <strong>Collection:</strong> {result.collectionName}
                  </p>
                  <p>
                    <strong>Sample Document ID:</strong>{" "}
                    {result.sampleDocumentId}
                  </p>
                  <p>
                    <strong>Database Size:</strong>{" "}
                    {(result.databaseSize / 1024).toFixed(2)} KB
                  </p>
                  <p>
                    <strong>Document Count:</strong> {result.documentCount}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
