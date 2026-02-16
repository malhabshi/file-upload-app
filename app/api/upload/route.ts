import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export async function POST(request: NextRequest) {
  try {
    const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!credentialsJson) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing credentials' },
        { status: 500 }
      );
    }

    const credentials = JSON.parse(credentialsJson);

    const storage = new Storage({
      projectId: credentials.project_id,
      credentials: credentials
    });

    const bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `uploads/${timestamp}_${safeFileName}`;

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
  const hasCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  return NextResponse.json({ 
    message: 'Upload API is ready',
    env_configured: hasCredentials
  });
}