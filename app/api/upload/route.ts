import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

// Find the credentials file
const credentialsDir = path.join(process.cwd(), 'credentials');
let keyFilename = undefined;

try {
  const files = fs.readdirSync(credentialsDir);
  const jsonFile = files.find(f => f.endsWith('.json'));
  if (jsonFile) {
    keyFilename = path.join(credentialsDir, jsonFile);
    console.log('✅ Found credentials file:', jsonFile);
  }
} catch (error) {
  console.log('No credentials folder found');
}

const storage = new Storage({
  projectId: 'studio-9484431255-91d96',
  ...(keyFilename && { keyFilename })
});

const bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');

export async function POST(request: NextRequest) {
  try {
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
    status: 'ok'
  });
}