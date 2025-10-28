# Audio Upload Setup Guide

This guide explains how to configure audio recording uploads to Supabase Storage.

## 📋 Overview

The audio upload system allows users to:
- Record audio directly in the browser
- Automatically upload recordings to Supabase Storage
- Store audio files securely with user-specific folders
- Play back recordings with a built-in audio player
- Handle upload errors with retry functionality

## 🚀 Setup Instructions

### 1. Configure Supabase Storage Bucket

Run the storage schema SQL in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `src/lib/supabase/storage-schema.sql`
4. Click **Run** to execute

This will:
- ✅ Create a `recordings` bucket
- ✅ Set up public access policies
- ✅ Configure delete permissions (users can only delete their own files)

### 2. Verify Bucket Configuration

After running the SQL:

1. Go to **Storage** in your Supabase Dashboard
2. You should see a `recordings` bucket listed
3. Click on it to verify it's set to **Public**
4. Check the **Policies** tab to see the three policies

### 3. Test the Upload Flow

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/practice`

3. Click the record button and record a short audio clip

4. Stop the recording

5. You should see:
   - "Uploading..." progress indicator
   - "Recording uploaded successfully!" toast
   - An audio player with your recording

6. Check Supabase Storage:
   - Go to **Storage** > **recordings**
   - You should see a folder with your user ID (or `guest_*` for guests)
   - Inside, you'll find the uploaded audio file

## 📁 File Structure

### Storage Organization

```
recordings/
├── {userId}/
│   ├── {userId}_1234567890.webm
│   ├── {userId}_1234567891.webm
│   └── ...
└── guest_{timestamp}_{random}/
    ├── guest_{timestamp}_{random}_1234567890.webm
    └── ...
```

### Code Organization

```
src/
├── lib/
│   ├── storage/
│   │   ├── config.ts         # Storage constants and error messages
│   │   └── audio.ts          # Upload/delete functions
│   └── supabase/
│       └── storage-schema.sql # Bucket setup SQL
├── utils/
│   └── audio.ts              # Audio utility functions
├── components/
│   └── practice/
│       ├── VoiceRecorder.tsx # Recording + upload UI
│       └── UploadStatus.tsx  # Upload progress indicator
└── app/
    └── api/
        └── session/
            └── upload/
                └── route.ts  # Upload API endpoint
```

## 🔧 Configuration

### File Size Limits

Current settings (in `src/lib/storage/config.ts`):
- **Max file size**: 10MB
- **Allowed formats**: audio/webm, audio/mp4, audio/mpeg, audio/wav, audio/ogg

To change these:

```typescript
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // Change this value
  ALLOWED_AUDIO_TYPES: [
    'audio/webm',
    'audio/mp4',
    // Add more types here
  ],
}
```

### Retention Policies

- **Guest recordings**: Auto-delete after 1 hour (not yet implemented)
- **User recordings**: Keep for 30 days (not yet implemented)

## 🎯 Usage in Components

### Basic Usage

```tsx
import { VoiceRecorder } from '@/components/practice/VoiceRecorder'

function MyComponent() {
  const handleComplete = (blob: Blob, audioUrl?: string) => {
    console.log('Recording blob:', blob)
    console.log('Uploaded URL:', audioUrl)
    // Use audioUrl to save to database, play back, etc.
  }

  return (
    <VoiceRecorder
      onRecordingComplete={handleComplete}
      maxDuration={90}
      autoUpload={true}  // Enable auto-upload (default: true)
    />
  )
}
```

### Disable Auto-Upload

If you want to handle upload manually:

```tsx
<VoiceRecorder
  onRecordingComplete={(blob) => {
    // Handle blob manually
    // Upload later or process differently
  }}
  autoUpload={false}
/>
```

### Manual Upload

```typescript
import { uploadAudio } from '@/lib/storage/audio'

const handleManualUpload = async (blob: Blob, userId: string) => {
  const result = await uploadAudio(blob, userId)
  
  if (result.success) {
    console.log('Uploaded to:', result.audioUrl)
  } else {
    console.error('Upload failed:', result.error)
  }
}
```

## 🐛 Troubleshooting

### Upload fails with "bucket not found"

1. Make sure you ran the `storage-schema.sql` script
2. Verify the bucket exists in Supabase Dashboard
3. Check bucket name matches `STORAGE_CONFIG.BUCKET` in config.ts

### Files upload but can't be accessed

1. Verify bucket is set to **Public**
2. Check that "Anyone can view recordings" policy exists
3. Try accessing the URL directly in a new browser tab

### Upload succeeds but files disappear

1. Check your storage retention policies
2. Verify you haven't hit storage quota limits
3. Check Supabase logs for any cleanup jobs

### Permission errors

1. Verify all three policies are created:
   - Anyone can upload recordings
   - Anyone can view recordings  
   - Users can delete own recordings
2. Check RLS is enabled on storage.objects
3. Try re-running the storage schema SQL

## 📊 API Reference

### Upload Endpoint

**POST** `/api/session/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `audio` file

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://xxx.supabase.co/storage/v1/object/public/recordings/user_123/user_123_1234567890.webm",
  "userId": "user_123",
  "size": 245678,
  "type": "audio/webm"
}
```

**Errors:**
- `400`: Invalid file, too large, or wrong format
- `500`: Upload failed or server error

### Storage Functions

#### `uploadAudio(audioBlob, userId)`

Uploads an audio blob to Supabase Storage.

**Returns:**
```typescript
{
  success: boolean
  audioUrl?: string
  error?: string
}
```

#### `deleteAudio(audioUrl)`

Deletes an audio file from storage.

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

#### `getAudioUrl(path)`

Gets the public URL for an audio file path.

**Returns:** `string`

## ✅ Testing Checklist

- [ ] Bucket created in Supabase
- [ ] Three policies exist and are correct
- [ ] Record 5-second audio → uploads successfully
- [ ] Record 2-minute audio → handles larger file
- [ ] Disconnect internet → shows error, allows retry
- [ ] Audio URL is valid and playable
- [ ] Files appear in Supabase Storage under correct folder
- [ ] Can play back recording in browser
- [ ] Upload progress indicator shows during upload
- [ ] Success toast appears after upload

## 🚧 Future Enhancements

Planned features (not yet implemented):

1. **Cleanup Jobs**
   - Auto-delete guest recordings after 1 hour
   - Archive user recordings after 30 days

2. **Compression**
   - Compress audio before upload to reduce size
   - Support for different quality settings

3. **Real Upload Progress**
   - Use XMLHttpRequest for real progress tracking
   - Show accurate upload percentage

4. **Retry Logic**
   - Exponential backoff for network errors
   - Store blob in state for retry without re-recording

5. **Signed URLs**
   - Private recordings with time-limited access
   - Secure download links

## 🔗 Related Documentation

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [PRACTICE_PAGE_SETUP.md](./PRACTICE_PAGE_SETUP.md)


