import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle,
  ChevronLeft, Trash2, Image as ImageIcon, Loader2, X
} from 'lucide-react';

import { projectId } from '/utils/supabase/info';
import { EmojiFlag } from '../../components/EmojiFlag';

function encodeCsvValue(value: unknown) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && ch === ',') { row.push(value); value = ''; }
    else if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(value); value = '';
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
    } else value += ch;
  }
  if (quoted) throw new Error('Unclosed CSV quoted field');
  row.push(value);
  if (row.some(cell => cell.trim())) rows.push(row);
  const headers = rows.shift()?.map(v => v.replace(/^\uFEFF/, '').trim()) || [];
  if (!headers.includes('title_en')) throw new Error('Invalid template: missing title_en column');
  return rows.map(cells => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])));
}

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2`;

const TEMPLATE_COLUMNS = [
  'title_en', 'title_ar', 'description_en', 'description_ar',
  'destination_en', 'destination_ar', 'price', 'currency', 'pricing_model', 'rate_matrix',
  'duration_days', 'departure_city', 'max_travelers', 'flag',
  'trip_type', 'is_featured', 'is_active',
  'includes_en', 'includes_ar', 'excludes_en', 'excludes_ar',
];

const TEMPLATE_EXAMPLE = {
  title_en: 'Luxury Maldives Escape',
  title_ar: 'رحلة المالديف الفاخرة',
  description_en: '7 days of pure relaxation...',
  description_ar: 'سبعة أيام من الاسترخاء...',
  destination_en: 'Maldives',
  destination_ar: 'المالديف',
  price: '8500',
  currency: 'SAR',
  pricing_model: 'fixed',
  rate_matrix: '',
  duration_days: '7',
  departure_city: 'Riyadh',
  max_travelers: '20',
  flag: '\u{1F1F2}\u{1F1FB}',
  trip_type: 'external',
  is_featured: 'yes',
  is_active: 'yes',
  includes_en: 'Round-trip flights | 5-star hotel | Breakfast daily',
  includes_ar: 'رحلات طيران ذهاب وعودة | فندق 5 نجوم | إفطار يومي',
  excludes_en: 'Personal expenses | Travel insurance',
  excludes_ar: 'المصاريف الشخصية | تأمين السفر',
};

interface ParsedPackage {
  index: number;
  data: Record<string, any>;
  coverImage?: File;
  coverImagePreview?: string;
  uploadedCoverUrl?: string;
  status: 'pending' | 'uploading' | 'ready' | 'imported' | 'error';
  error?: string;
}

export function AdminBulkImport() {
  const { adminFetch, token } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedPackages, setParsedPackages] = useState<ParsedPackage[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');

  function downloadTemplate() {
    const csv = [TEMPLATE_COLUMNS.join(','), TEMPLATE_COLUMNS.map(k => encodeCsvValue((TEMPLATE_EXAMPLE as Record<string, string>)[k])).join(',')].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'etihad_packages_template.csv'; link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError('');
    setImportResult(null);
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Please use the CSV template');
      if (file.size > 2 * 1024 * 1024) throw new Error('CSV exceeds 2 MB upload limit');
      const data = parseCsv(await file.text());
      if (!data.length) throw new Error('The file is empty or has no data rows');
      setParsedPackages(data.map((row, i) => ({ index: i, data: row, status: 'pending' as const })));
      setStep('review');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Unable to read CSV');
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/admin/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  }

  function handleCoverImage(pkgIndex: number, file: File) {
    // Client-side image optimization: resize large images using canvas
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Only resize if image is larger than max dimensions
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
          });
          const previewUrl = URL.createObjectURL(blob);

          setParsedPackages(prev => prev.map((p, i) =>
            i === pkgIndex
              ? { ...p, coverImage: optimizedFile, coverImagePreview: previewUrl }
              : p
          ));
        }, 'image/webp', 0.82); // 82% quality WebP
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function removeCoverImage(pkgIndex: number) {
    setParsedPackages(prev => prev.map((p, i) =>
      i === pkgIndex
        ? { ...p, coverImage: undefined, coverImagePreview: undefined, uploadedCoverUrl: undefined }
        : p
    ));
  }

  function removePackage(pkgIndex: number) {
    setParsedPackages(prev => prev.filter((_, i) => i !== pkgIndex));
  }

  async function handleImport() {
    setImporting(true);
    setImportResult(null);

    // Step 1: Upload all images first
    const updated = [...parsedPackages];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].coverImage && !updated[i].uploadedCoverUrl) {
        updated[i].status = 'uploading';
        setParsedPackages([...updated]);
        try {
          const url = await uploadImage(updated[i].coverImage!);
          updated[i].uploadedCoverUrl = url;
          updated[i].status = 'ready';
        } catch (err) {
          updated[i].status = 'error';
          updated[i].error = `Image upload failed: ${err}`;
        }
        setParsedPackages([...updated]);
      } else {
        updated[i].status = 'ready';
      }
    }

    // Step 2: Build package data with uploaded image URLs
    const readyPackages = updated
      .filter(p => p.status === 'ready')
      .map(p => ({
        ...p.data,
        cover_image_url: p.uploadedCoverUrl || p.data.cover_image_url || '',
      }));

    if (readyPackages.length === 0) {
      setImporting(false);
      setImportResult({ error: 'No packages ready for import.' });
      return;
    }

    // Step 3: Send bulk import request
    try {
      const res = await adminFetch('/admin/packages/bulk', {
        method: 'POST',
        body: JSON.stringify({ packages: readyPackages }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        setStep('done');
        // Update statuses
        if (data.results) {
          const finalUpdated = [...updated];
          for (const result of data.results) {
            const idx = finalUpdated.findIndex(p => p.status === 'ready');
            if (idx >= 0) {
              finalUpdated[idx].status = result.status === 'ok' ? 'imported' : 'error';
              if (result.error) finalUpdated[idx].error = result.error;
            }
          }
          setParsedPackages(finalUpdated);
        }
      } else {
        setImportResult({ error: data.error || 'Import failed' });
      }
    } catch (err) {
      setImportResult({ error: `Network error: ${err}` });
    } finally {
      setImporting(false);
    }
  }

  function resetAll() {
    setParsedPackages([]);
    setParseError('');
    setImportResult(null);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/packages" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Bulk Package Import</h2>
          <p className="text-sm text-gray-500">Import multiple packages from an Excel or CSV file. Upload images per package.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {['Upload File', 'Review & Upload Images', 'Done'].map((label, i) => {
          const stepKeys = ['upload', 'review', 'done'] as const;
          const isActive = step === stepKeys[i];
          const isDone = stepKeys.indexOf(step) > i;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive ? 'bg-[#D32F2F] text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{isDone ? '\u2713' : i + 1}</div>
              <span className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          );
        })}
      </div>

      {/* ===== STEP 1: UPLOAD ===== */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Download Template */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">1. Download Template</h3>
            <p className="text-sm text-gray-500 mb-3">
              Download the Excel template, fill in your packages data, then upload it below.
              Use <strong>pipe (|)</strong> to separate multiple items in includes/excludes columns.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Download Template (.csv)
            </button>
          </div>

          {/* Upload File */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">2. Upload Filled File</h3>
            <p className="text-sm text-gray-500 mb-3">Supports CSV files. Download the template above.</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[#D32F2F] hover:bg-red-50/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600">Click to select your Excel/CSV file</p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {parseError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mt-4">
              <AlertCircle size={16} className="shrink-0" />
              {parseError}
            </div>
          )}

          {/* Column Reference */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">Column Reference</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {TEMPLATE_COLUMNS.map(col => (
                <div key={col} className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-1.5 h-1.5 bg-[#D32F2F] rounded-full shrink-0" />
                  <code className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">{col}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Tip:</strong> For includes/excludes, use pipe <code className="bg-gray-50 px-1 rounded">|</code> to separate items.
              E.g. <code className="bg-gray-50 px-1 rounded">Flights | Hotel | Breakfast</code>
            </p>
          </div>
        </div>
      )}

      {/* ===== STEP 2: REVIEW ===== */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-800">
                {parsedPackages.length} package{parsedPackages.length > 1 ? 's' : ''} found
              </p>
              <div className="flex gap-2">
                <button onClick={resetAll} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg">
                  Start Over
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || parsedPackages.length === 0}
                  className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-5 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {importing ? 'Importing...' : 'Import All'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              You can optionally upload a cover image for each package below. Images will be automatically optimized (converted to WebP, resized to max 1200x800).
            </p>
          </div>

          {parsedPackages.map((pkg, idx) => (
            <div key={idx} className={`bg-white rounded-xl shadow-sm border p-4 ${
              pkg.status === 'imported' ? 'border-green-200 bg-green-50/30' :
              pkg.status === 'error' ? 'border-red-200 bg-red-50/30' :
              pkg.status === 'uploading' ? 'border-amber-200 bg-amber-50/30' :
              'border-gray-100'
            }`}>
              <div className="flex items-start gap-4">
                {/* Image upload area */}
                <div className="shrink-0">
                  {pkg.coverImagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img src={pkg.coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeCoverImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#D32F2F] cursor-pointer transition-colors bg-gray-50">
                      <ImageIcon size={18} className="text-gray-300 mb-1" />
                      <span className="text-[9px] text-gray-400 font-medium">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCoverImage(idx, f);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Package info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{pkg.data.title_en || '(No title)'}</p>
                      <p className="text-xs text-gray-400" dir="rtl">{pkg.data.title_ar || ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pkg.status === 'uploading' && <Loader2 size={14} className="animate-spin text-amber-500" />}
                      {pkg.status === 'imported' && <CheckCircle size={14} className="text-green-500" />}
                      {pkg.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                      <button onClick={() => removePackage(idx)} className="p-1 text-gray-300 hover:text-red-500 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span>{pkg.data.destination_en} <EmojiFlag emoji={pkg.data.flag} /></span>
                    <span>{pkg.data.pricing_model === 'rate_matrix' ? 'Starting from ' : ''}{pkg.data.price} {pkg.data.currency || 'SAR'}</span>
                    <span>{pkg.data.duration_days} days</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      pkg.data.trip_type === 'internal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {pkg.data.trip_type === 'internal' ? 'Domestic' : 'International'}
                    </span>
                  </div>
                  {pkg.error && <p className="text-xs text-red-500 mt-1">{pkg.error}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== STEP 3: DONE ===== */}
      {step === 'done' && importResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {importResult.error ? (
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={24} />
              <div>
                <p className="font-semibold">Import Failed</p>
                <p className="text-sm">{importResult.error}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 text-green-700 mb-4">
                <CheckCircle size={24} />
                <div>
                  <p className="font-semibold">Import Complete!</p>
                  <p className="text-sm">
                    {importResult.imported} of {importResult.total} packages imported successfully.
                    {importResult.errors > 0 && ` ${importResult.errors} failed.`}
                  </p>
                </div>
              </div>

              {/* Results table */}
              {importResult.results && (
                <div className="border border-gray-100 rounded-lg overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">#</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Title</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {importResult.results.map((r: any) => (
                        <tr key={r.index}>
                          <td className="px-4 py-2 text-gray-400">{r.index + 1}</td>
                          <td className="px-4 py-2 text-gray-700">{r.title || '(untitled)'}</td>
                          <td className="px-4 py-2 text-center">
                            {r.status === 'ok' ? (
                              <span className="text-green-600 text-xs font-semibold">Imported</span>
                            ) : (
                              <span className="text-red-500 text-xs font-semibold" title={r.error}>Failed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={resetAll} className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
              Import More
            </button>
            <Link to="/admin/packages" className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-lg text-sm font-semibold">
              View All Packages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}