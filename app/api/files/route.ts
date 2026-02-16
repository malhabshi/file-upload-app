import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { File } from '@google-cloud/storage';

// Initialize Storage with credentials from environment variable
let storage: Storage;
let bucket: any;

try {
  const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!credentialsJson) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    throw new Error('Missing Firebase credentials');
  }

  // Parse the credentials
  const credentials = JSON.parse(credentialsJson);

  // 🔥 FIX: Replace escaped newlines in the private key
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  storage = new Storage({
    projectId: credentials.project_id,
    credentials: credentials
  });

  bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');
  
  console.log('✅ Firebase Storage initialized successfully');

} catch (error) {
  console.error('❌ Failed to initialize Firebase Storage:', error);
}

export async function GET() {
  try {
    if (!bucket) {
      return NextResponse.json(
        { error: 'Storage not initialized' },
        { status: 500 }
      );
    }

    const [files] = await bucket.getFiles({ prefix: 'uploads/' });
    
    const fileList = await Promise.all(files.map(async (file: File) => {
      const [metadata] = await file.getMetadata();
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return {
        name: file.name.replace('uploads/', ''),
        url: url,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        contentType: metadata.contentType
      };
    }));

    // Handle undefined timeCreated safely
    fileList.sort((a, b) => {
      const dateA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const dateB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ files: fileList });

  } catch (error: any) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}