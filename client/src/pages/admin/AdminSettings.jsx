import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Upload, Loader2, CheckCircle, Trash2, Play,
  ShieldCheck, ShieldOff, QrCode, KeyRound,
} from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';

function useSetting(key) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => api.get(`/settings/${key}`).then((r) => r.data.data.value),
    staleTime: 60 * 1000,
  });
}

// ─── 2FA Section ─────────────────────────────────────────────────────────────

function TwoFactorSection() {
  const queryClient = useQueryClient();
  const [step, setStep]       = useState('idle'); // idle | setup | enable | disable
  const [qrData, setQrData]   = useState(null);
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['totp', 'status'],
    queryFn:  () => api.get('/auth/totp/status').then((r) => r.data.data),
  });

  const totpEnabled = status?.totpEnabled;

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/totp/setup');
      setQrData(res.data.data);
      setStep('setup');
      setCode('');
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) { toast.error('Enter the 6-digit code from the app'); return; }
    setLoading(true);
    try {
      await api.post('/auth/totp/enable', { code });
      toast.success('Two-factor authentication enabled!');
      setStep('idle');
      setQrData(null);
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['totp', 'status'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) { toast.error('Enter the 6-digit code from the app to confirm'); return; }
    setLoading(true);
    try {
      await api.post('/auth/totp/disable', { code });
      toast.success('Two-factor authentication disabled');
      setStep('idle');
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['totp', 'status'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand-600" />
        <h2 className="text-base font-semibold text-neutral-900">
          Two-Factor Authentication (2FA)
        </h2>
      </div>
      <p className="mb-5 text-sm text-neutral-500">
        Protect your admin account with Google Authenticator. You'll need to enter a 6-digit code each time you log in.
      </p>

      {statusLoading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking status…
        </div>
      ) : (
        <>
          {/* Status badge */}
          <div className="mb-5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              totpEnabled
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-neutral-100 text-neutral-500'
            }`}>
              {totpEnabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
              {totpEnabled ? '2FA Enabled' : '2FA Disabled'}
            </span>
          </div>

          {/* ── SETUP FLOW ─────────────────────────────────────── */}
          {step === 'setup' && qrData && (
            <div className="mb-5 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Step 1 — Scan this QR code with Google Authenticator
              </p>
              <img
                src={qrData.qrDataUrl}
                alt="TOTP QR Code"
                className="mx-auto h-44 w-44 rounded-lg border border-neutral-200 bg-white p-2"
              />
              <p className="text-xs text-neutral-500 text-center break-all">
                Manual key: <span className="font-mono font-semibold text-neutral-800">{qrData.secret}</span>
              </p>
              <div className="border-t border-neutral-200 pt-4">
                <p className="mb-2 text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Step 2 — Enter the 6-digit code from the app
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-32 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <Button onClick={handleEnable} loading={loading} disabled={code.length !== 6}>
                    Verify &amp; Enable
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setStep('idle'); setQrData(null); setCode(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── DISABLE FLOW ───────────────────────────────────── */}
          {step === 'disable' && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-5">
              <p className="mb-3 text-sm font-medium text-red-700">
                Enter your current authenticator code to disable 2FA
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-32 rounded-lg border border-red-200 bg-white px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
                <Button variant="danger" onClick={handleDisable} loading={loading} disabled={code.length !== 6}>
                  Disable 2FA
                </Button>
                <Button variant="ghost" onClick={() => { setStep('idle'); setCode(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* ── ACTION BUTTONS ─────────────────────────────────── */}
          {step === 'idle' && (
            <div>
              {!totpEnabled ? (
                <Button onClick={handleSetup} loading={loading}>
                  <ShieldCheck className="h-4 w-4" />
                  Set Up 2FA
                </Button>
              ) : (
                <button
                  onClick={() => { setStep('disable'); setCode(''); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ShieldOff className="h-4 w-4" />
                  Disable 2FA
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: videoUrl, isLoading: videoLoading } = useSetting('brandVideoUrl');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState(null);
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
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable)
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText).data.url);
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed')); }
            catch { reject(new Error('Upload failed')); }
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        const token   = localStorage.getItem('token');
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

  const currentVideo = preview || videoUrl;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">Settings</h1>

      {/* ── 2FA Section ──────────────────────────────────────────────────── */}
      <TwoFactorSection />

      {/* ── Brand Video Section ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2">
          <Play className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-semibold text-neutral-900">Brand Video</h2>
        </div>
        <p className="mb-5 text-sm text-neutral-500">
          Upload your brand video. It will autoplay silently on the homepage.
        </p>

        {videoLoading ? (
          <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-neutral-100">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : currentVideo ? (
          <div className="mb-4 overflow-hidden rounded-xl bg-neutral-950">
            <video src={currentVideo} controls className="aspect-video w-full object-cover" />
            <div className="flex items-center justify-between px-4 py-2.5">
              <p className="max-w-[70%] truncate text-xs text-neutral-400">{currentVideo}</p>
              {!preview && (
                <button
                  onClick={() => saveVideoUrl.mutate('')}
                  disabled={saveVideoUrl.isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
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

        {uploading && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Uploading to Cloudinary…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
            <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
            <Button size="sm" onClick={() => saveVideoUrl.mutate(preview)} loading={saveVideoUrl.isPending}>
              <CheckCircle className="h-4 w-4" /> Save &amp; Publish
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Supported: MP4, WebM, MOV, AVI · Max 300 MB
        </p>
      </div>
    </div>
  );
}
