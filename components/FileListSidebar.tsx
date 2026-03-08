'use client';

import { FileItem } from '@/types/ocr';

interface FileListSidebarProps {
  files: FileItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const StatusIcon = ({ status }: { status: FileItem['status'] }) => {
  if (status === 'pending') {
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
    );
  }
  if (status === 'processing') {
    return (
      <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    );
  }
  if (status === 'done') {
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

const statusLabel: Record<FileItem['status'], string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  done: 'Hoàn thành',
  error: 'Lỗi',
};

export default function FileListSidebar({ files, selectedId, onSelect }: FileListSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Danh sách file ({files.length})
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {files.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className={`w-full text-left px-3 py-3 flex items-start gap-2 hover:bg-gray-50 transition-colors ${
                selectedId === item.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
            >
              <span className="mt-0.5 shrink-0">
                <StatusIcon status={item.status} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-800 truncate">{item.file.name}</span>
                <span className={`text-xs ${
                  item.status === 'done' ? 'text-green-600' :
                  item.status === 'error' ? 'text-red-500' :
                  item.status === 'processing' ? 'text-blue-500' :
                  'text-gray-400'
                }`}>
                  {item.status === 'error' && item.error ? item.error : statusLabel[item.status]}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
