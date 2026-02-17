'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UploadPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    if (studentId) formData.append('studentId', studentId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
        setFile(null);
        (document.getElementById('fileInput') as HTMLInputElement).value = '';
      } else {
        setMessage(`❌ Error: ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Upload failed - check console');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        File Upload
      </h1>
      
      {studentId && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          color: '#0050b3'
        }}>
          Student ID: {studentId}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{
        padding: '2rem',
        border: '1px solid #eaeaea',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            style={{
              padding: '0.5rem',
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={uploading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: uploading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
