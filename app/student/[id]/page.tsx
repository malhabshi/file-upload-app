'use client';

import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function StudentPage() {
  const params = useParams();
  const studentId = params.id;

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">
            Student Profile {studentId && `- ID: ${studentId}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Welcome to the student profile page. This is a dynamic route that shows information for student ID: <span className="font-bold">{studentId}</span>
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
            <p className="text-blue-600">Route: /student/{studentId}</p>
            <p className="text-blue-600">Page Type: Dynamic Route with [id] parameter</p>
          </div>

          <Button asChild className="mt-4">
            <a 
              href="https://file-upload-app-omega.vercel.app/upload-page" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Documents
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}