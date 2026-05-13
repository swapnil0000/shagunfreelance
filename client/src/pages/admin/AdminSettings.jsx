import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle, Trash2, Play } from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';

function useSetting(key) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => api.get(`/settings/${key}`).then((r) => r.data.data.value),
    staleTime: 60 * 1000,
  });
}

export default function AdminSettings() {
  const queryClient = useQueryClient();

  // ── Brand Video ──────────────────────────────────────────────────────────────
  const { data: videoUrl, isLoading: videoLoading } = useSetting('brandVideoUrl');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const saveVideoUrl = useMutation({
    mutationFn: (value) => api.put('/settings/brandVideoUrl', { value }),
    onSuccess: () => {
      toast.success('Brand video updated');
      queryClient.invalidateQueries({ queryKey: ['settings', 'brandVideoUrl'] });
      setPreview(null);
    },
    onError: () => toast.error('Failed to save video URL'),
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 300 MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Use XMLHttpRequest to track upload progress
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            resolve(res.data.url);
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.message || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));

        const token = localStorage.getItem('token');
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        xhr.open('POST', `${baseURL}/upload/video`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      setPreview(url);
      toast.success('Video uploaded! Click "Save" to publish it on the website.');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    saveVideoUrl.mutate('');
  };

  const currentVideo = preview || videoUrl;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">Settings</h1>

      {/* ── Brand Video Section ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2">
          <Play className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-semibold text-neutral-900">Brand Video</h2>
        </div>
        <p className="mb-5 text-sm text-neutral-500">
          Upload your brand video. It will autoplay silently on the homepage. Cloudinary automatically compresses it for fast loading.
        </p>

        {/* Current / Preview video */}
        {videoLoading ? (
          <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-neutral-100">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : currentVideo ? (
          <div className="mb-4 overflow-hidden rounded-xl bg-neutral-950">
            <video
              src={currentVideo}
              controls
              className="aspect-video w-full object-cover"
            />
            <div className="flex items-center justify-between px-4 py-2.5">
              <p className="text-xs text-neutral-400 truncate max-w-[70%]">{currentVideo}</p>
              {!preview && (
                <button
                  onClick={handleRemoveVideo}
                  disabled={saveVideoUrl.isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
            <Play className="h-8 w-8" />
            <p className="text-sm">No video set</p>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Uploading to Cloudinary…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400">
              Large files may take a few minutes. Please keep this page open.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <label className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
            <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading…' : 'Upload Video'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {preview && (
            <Button
              size="sm"
              onClick={() => saveVideoUrl.mutate(preview)}
              loading={saveVideoUrl.isPending}
            >
              <CheckCircle className="h-4 w-4" />
              Save &amp; Publish
            </Button>
          )}
        </div>

        <p className="mt-3 text-xs text-neutral-400">
          Supported formats: MP4, WebM, MOV, AVI · Max size: 300 MB
        </p>
      </div>
    </div>
  );
}
