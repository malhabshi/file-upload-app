'use client';

import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FileItem {
  name: string;
  url: string;
  size: number;
  timeCreated: string;
  contentType: string;
}

export default function StudentPage() {
  const params = useParams();
  const studentId = params.id;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Could not load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Filter files for this student (if filenames contain studentId)
  const studentFiles = files.filter(file => 
    file.name.includes(studentId as string) || 
    file.name.toLowerCase().includes('student')
  );

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">
            Student Profile {studentId && `- ID: ${studentId}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Student Information</h3>
            <p className="text-gray-700">
              <span className="font-medium">Student ID:</span> {studentId}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status:</span> Active
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Documents</h3>
              <Button asChild size="sm">
                <a href={`/upload-page?studentId=${studentId}`}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload New
                </a>
              </Button>
            </div>
            
            {loading && <p className="text-gray-500">Loading files...</p>}
            
            {error && (
              <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-yellow-700">
                Note: {error} - but you can still upload files.
              </div>
            )}
            
            {!loading && !error && studentFiles.length === 0 && (
              <p className="text-gray-500">No files uploaded for this student yet.</p>
            )}
            
            {studentFiles.length > 0 && (
              <div className="space-y-2">
                {studentFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.contentType)}
                      <div>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {file.name.replace(/^\d+_/, '').replace(/_/g, ' ')}
                        </a>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatFileSize(file.size)} • Uploaded {formatDate(file.timeCreated)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">Download</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
