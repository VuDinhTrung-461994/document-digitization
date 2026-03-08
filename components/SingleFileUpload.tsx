'use client';

import { useState, useRef, DragEvent } from 'react';
import { OcrResult } from '@/types/ocr';
import OcrResultCard from '@/components/OcrResultCard';
import PdfPreview from '@/components/PdfPreview';
import { Button } from '@/components/ui/button';

export default function SingleFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Chỉ hỗ trợ file PDF');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleOcr = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ocr', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi không xác định');
      }
      const data: OcrResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleInputChange}
            />
            {file ? (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-blue-600">Nhấn để chọn file khác</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📂</div>
                <p className="font-medium text-gray-700">Kéo thả file PDF vào đây</p>
                <p className="text-sm text-gray-500">hoặc nhấn để chọn file</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleOcr}
              disabled={!file || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xử lý OCR...
                </span>
              ) : (
                'Bắt đầu OCR'
              )}
            </Button>
            {file && (
              <Button variant="outline" onClick={handleReset}>
                Xóa
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200" style={{ height: '90vh' }}>
            {/* PDF Preview — 2/3 */}
            <div className="flex-[2] flex flex-col border-r border-gray-200 bg-gray-100 min-w-0">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
                <span className="text-xs font-medium text-gray-500 truncate block">{file?.name}</span>
              </div>
              <div className="flex-1 min-h-0">
                {file && <PdfPreview file={file} className="h-full" />}
              </div>
            </div>

            {/* OCR Result — 1/3 */}
            <div className="flex-[1] overflow-y-auto p-4 bg-white min-w-0">
              <OcrResultCard result={result} fileName={file?.name} />
            </div>
          </div>

          <Button variant="outline" onClick={handleReset} className="w-full">
            Tải lên file khác
          </Button>
        </div>
      )}
    </div>
  );
}
