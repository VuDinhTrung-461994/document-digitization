'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FileItem, OcrResult } from '@/types/ocr';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileListSidebar from '@/components/FileListSidebar';
import OcrResultCard from '@/components/OcrResultCard';
import PdfPreview from '@/components/PdfPreview';
import SummaryTable from '@/components/SummaryTable';

export default function FolderUpload() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<string[]>([]);
  const filesRef = useRef<FileItem[]>([]);
  const runningRef = useRef(false);

  filesRef.current = files;

  const doneCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const totalFinished = doneCount + errorCount;
  const progress = files.length > 0 ? Math.round((totalFinished / files.length) * 100) : 0;

  const updateFile = useCallback((id: string, patch: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const processNext = useCallback(async () => {
    if (!runningRef.current) return;
    const id = queueRef.current.shift();
    if (!id) {
      setIsRunning(false);
      runningRef.current = false;
      return;
    }
    const fileItem = filesRef.current.find((f) => f.id === id);
    if (!fileItem) {
      processNext();
      return;
    }

    updateFile(id, { status: 'processing' });
    setSelectedId(id);

    try {
      const formData = new FormData();
      formData.append('file', fileItem.file);
      const res = await fetch('/api/ocr', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        updateFile(id, { status: 'error', error: data.error || 'Lỗi không xác định' });
      } else {
        const result: OcrResult = await res.json();
        updateFile(id, { status: 'done', result });
      }
    } catch {
      updateFile(id, { status: 'error', error: 'Không thể kết nối đến server' });
    }

    processNext();
  }, [updateFile]);

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []).filter((f) =>
      f.name.toLowerCase().endsWith('.pdf')
    );
    if (rawFiles.length === 0) return;
    const items: FileItem[] = rawFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      status: 'pending',
    }));
    setFiles(items);
    setSelectedId(null);
    setIsRunning(false);
    runningRef.current = false;
  };

  const handleStart = () => {
    if (files.length === 0) return;
    const pendingIds = files.filter((f) => f.status === 'pending').map((f) => f.id);
    if (pendingIds.length === 0) return;
    queueRef.current = [...pendingIds];
    runningRef.current = true;
    setIsRunning(true);
    processNext();
  };

  const handleReset = () => {
    runningRef.current = false;
    queueRef.current = [];
    setFiles([]);
    setIsRunning(false);
    setSelectedId(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectedFile = files.find((f) => f.id === selectedId);
  const allDone = files.length > 0 && totalFinished === files.length;

  return (
    <div className="space-y-5">
      {files.length === 0 ? (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors border-gray-300 bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            // @ts-ignore - webkitdirectory is non-standard
            webkitdirectory="true"
            multiple
            className="hidden"
            onChange={handleFolderChange}
          />
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="font-medium text-gray-700">Nhấn để chọn thư mục</p>
            <p className="text-sm text-gray-500">Chỉ các file PDF trong thư mục sẽ được xử lý</p>
          </div>
        </div>
      ) : (
        <>
          {/* Status bar */}
          <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-gray-700">{files.length} file PDF</span>
              <span className="text-gray-400">|</span>
              <span className="text-green-600">{doneCount} hoàn thành</span>
              {errorCount > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-red-500">{errorCount} lỗi</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {!isRunning && !allDone && (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Bắt đầu xử lý
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleReset}>
                Chọn lại
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {(isRunning || totalFinished > 0) && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tiến trình xử lý</span>
                <span>{totalFinished}/{files.length} file ({progress}%)</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Views */}
          {files.length > 0 && (
            <Tabs defaultValue="detail">
              <TabsList className="mb-3">
                <TabsTrigger value="detail">Chi tiết</TabsTrigger>
                <TabsTrigger value="summary">Tổng hợp</TabsTrigger>
              </TabsList>

              <TabsContent value="detail">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden" style={{ height: '90vh' }}>
                  {/* Sidebar danh sách file — cố định */}
                  <div className="w-48 shrink-0 border-r border-gray-200 overflow-y-auto">
                    <FileListSidebar files={files} selectedId={selectedId} onSelect={setSelectedId} />
                  </div>

                  {selectedFile ? (
                    <>
                      {/* PDF Preview — 2/3 phần còn lại */}
                      <div className="flex-[2] flex flex-col border-r border-gray-200 bg-gray-100 min-w-0">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
                          <p className="text-xs font-medium text-gray-500 truncate">{selectedFile.file.name}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                          <PdfPreview file={selectedFile.file} className="h-full" />
                        </div>
                      </div>

                      {/* OCR Result — 1/3 phần còn lại */}
                      <div className="flex-[1] overflow-y-auto p-3 bg-white min-w-0">
                        {selectedFile.status === 'done' && selectedFile.result ? (
                          <OcrResultCard result={selectedFile.result} fileName={selectedFile.file.name} />
                        ) : selectedFile.status === 'processing' ? (
                          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
                            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p className="text-sm">Đang xử lý OCR...</p>
                          </div>
                        ) : selectedFile.status === 'error' ? (
                          <div className="flex flex-col items-center justify-center h-48 gap-2 text-red-500">
                            <span className="text-3xl">⚠</span>
                            <p className="font-medium text-sm">Lỗi xử lý</p>
                            <p className="text-xs text-gray-500 text-center">{selectedFile.error}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                            <p>Chờ xử lý...</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      Chọn một file để xem preview và kết quả OCR
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <SummaryTable files={files} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
