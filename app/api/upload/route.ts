import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export async function POST(request: NextRequest) {
  try {
    // Try Base64 first, then fall back to regular JSON
    let credentials;
    
    // Check for Base64 encoded credentials (preferred)
    const base64Credentials = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (base64Credentials) {
      try {
        // Decode Base64 to JSON string
        const jsonString = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        credentials = JSON.parse(jsonString);
        console.log('✅ Using Base64 credentials');
      } catch (e) {
        console.error('Failed to parse Base64 credentials:', e);
        return NextResponse.json(
          { error: 'Invalid Base64 credentials format' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Server configuration error: Missing credentials' },
        { status: 500 }
      );
    }

    // 🔥 FIX: Replace escaped newlines in the private key
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const storage = new Storage({
      projectId: credentials.project_id,
      credentials: credentials
    });

    const bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const studentId = formData.get('studentId') as string | null;

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
    const fileName = `uploads/${timestamp}_${studentId ? studentId + '_' : ''}${safeFileName}`;

    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          studentId: studentId || 'unknown',
          uploadTime: new Date().toISOString()
        }
      }
    });

    // Generate a signed URL for the file (valid for 7 days)
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return NextResponse.json({
      message: '✅ File uploaded successfully!',
      fileName: fileName,
      url: url
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
  const hasBase64 = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  return NextResponse.json({ 
    message: 'Upload API is ready',
    using_base64: hasBase64,
    status: 'ok'
  });
}
