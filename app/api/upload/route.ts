import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize Storage with credentials from environment variable
let storage: Storage;
let bucket: any;

try {
  // Get credentials from environment variable
  const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!credentialsJson) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    throw new Error('Missing Firebase credentials');
  }

  // Parse the JSON string
  const credentials = JSON.parse(credentialsJson);

  // Initialize Storage with the credentials
  storage = new Storage({
    projectId: credentials.project_id,
    credentials: credentials
  });

  // Get the bucket
  bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');
  
  console.log('✅ Firebase Storage initialized successfully');

} catch (error) {
  console.error('❌ Failed to initialize Firebase Storage:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Check if bucket was initialized
    if (!bucket) {
      return NextResponse.json(
        { error: 'Storage not initialized - check server logs' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading:', file.name);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `uploads/${timestamp}_${safeFileName}`;

    // Upload to Firebase Storage
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadTime: new Date().toISOString()
        }
      }
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({
      message: '✅ File uploaded to Firebase!',
      fileName: fileName,
      url: publicUrl
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload API is ready',
    status: 'ok',
    env: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Credentials found' : 'Credentials missing'
  });
}