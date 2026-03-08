'use client';

import { useState } from 'react';
import SingleFileUpload from '@/components/SingleFileUpload';
import FolderUpload from '@/components/FolderUpload';

type Mode = 'single' | 'folder';

export default function Home() {
  const [mode, setMode] = useState<Mode>('single');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-[90vw] mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Số Hóa Tài Liệu
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Trích xuất thông tin văn bản từ file PDF bằng OCR tự động
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-3 mb-6 p-1 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm mx-auto">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>📄</span>
            <span>1 File PDF</span>
          </button>
          <button
            onClick={() => setMode('folder')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'folder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>📁</span>
            <span>Folder PDF</span>
          </button>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          {mode === 'single' ? <SingleFileUpload /> : <FolderUpload />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Hỗ trợ định dạng PDF · Kết quả trả về từ OCR API
        </p>
      </div>
    </div>
  );
}
