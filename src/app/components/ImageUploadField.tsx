import { useState, useRef, useCallback } from 'react';
import { Upload, Link2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { projectId } from '/utils/supabase/info';
import { useAdminAuth } from '../context/AdminAuthContext';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2`;

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  previewClass?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  hint = '',
  previewClass = 'w-full h-48 object-cover rounded-xl border border-gray-200',
}: ImageUploadFieldProps) {
  const { token } = useAdminAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_URL}/admin/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed.');
      } else {
        onChange(data.url);
      }
    } catch (e) {
      setUploadError(`Network error: ${e instanceof Error ? e.message : 'Upload connection failed'}`);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  }, [token]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit text-xs">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
            mode === 'upload' ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={12} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
            mode === 'url' ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 size={12} /> Photo URL
        </button>
      </div>

      {/* Upload area */}
      {mode === 'upload' && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging
              ? 'border-[#D32F2F] bg-red-50'
              : uploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-[#D32F2F] hover:bg-red-50/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 size={28} className="text-[#D32F2F] animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <ImageIcon size={20} className="text-[#D32F2F]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-[#D32F2F]">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP, GIF — max 5 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{uploadError}</p>
      )}

      {/* Hint */}
      {hint && !uploadError && <p className="text-xs text-gray-400">{hint}</p>}

      {/* Preview */}
      {value && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={12} /> Remove
            </button>
          </div>
          <img
            src={value}
            alt="Preview"
            className={previewClass}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            onLoad={e => { (e.target as HTMLImageElement).style.display = ''; }}
          />
        </div>
      )}
    </div>
  );
}
