import { NextResponse } from 'next/server';
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
  }
} catch (error) {
  console.log('No credentials folder found');
}

const storage = new Storage({
  projectId: 'studio-9484431255-91d96',
  ...(keyFilename && { keyFilename })
});

const bucket = storage.bucket('studio-9484431255-91d96.firebasestorage.app');

export async function GET() {
  try {
    // Get all files from the uploads folder
    const [files] = await bucket.getFiles({ prefix: 'uploads/' });
    
    const fileList = await Promise.all(files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return {
        name: file.name.replace('uploads/', ''),
        fullPath: file.name,
        url: url,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        contentType: metadata.contentType
      };
    }));

    // Sort by newest first (handle undefined dates safely)
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