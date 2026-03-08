'use client';

import { useRef, useState, useCallback } from 'react';
import { FileItem } from '@/types/ocr';

interface SummaryTableProps {
  files: FileItem[];
}

const DOC_SECRET_COLORS: Record<string, string> = {
  'Thường': 'bg-green-100 text-green-800',
  'Không mật': 'bg-green-100 text-green-800',
  'Mật': 'bg-yellow-100 text-yellow-800',
  'Tối mật': 'bg-orange-100 text-orange-800',
  'Tuyệt mật': 'bg-red-100 text-red-800',
};

const COLUMNS = [
  { key: 'stt',          label: 'STT',             defaultWidth: 48,  center: true },
  { key: 'tenFile',      label: 'Tên file',         defaultWidth: 180, center: false },
  { key: 'coQuan',       label: 'Cơ quan ban hành', defaultWidth: 200, center: false },
  { key: 'ngay',         label: 'Ngày tháng năm',   defaultWidth: 120, center: true },
  { key: 'soVanBan',     label: 'Số văn bản',       defaultWidth: 140, center: false },
  { key: 'theLoai',      label: 'Thể loại',         defaultWidth: 110, center: false },
  { key: 'trichYeu',     label: 'Trích yếu',        defaultWidth: 280, center: false },
  { key: 'nguoiKy',      label: 'Người ký',         defaultWidth: 180, center: false },
  { key: 'banChinh',     label: 'Bản chính/Sao',    defaultWidth: 110, center: true },
  { key: 'doMat',        label: 'Độ mật',           defaultWidth: 100, center: true },
];

const MIN_WIDTH = 40;

export default function SummaryTable({ files }: SummaryTableProps) {
  const [widths, setWidths] = useState<number[]>(COLUMNS.map((c) => c.defaultWidth));
  const dragging = useRef<{ colIdx: number; startX: number; startW: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent, colIdx: number) => {
    e.preventDefault();
    dragging.current = { colIdx, startX: e.clientX, startW: widths[colIdx] };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - dragging.current.startX;
      const newW = Math.max(MIN_WIDTH, dragging.current.startW + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[dragging.current!.colIdx] = newW;
        return next;
      });
    };

    const onMouseUp = () => {
      dragging.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [widths]);

  return (
    <div className="overflow-auto rounded-lg border border-gray-200" style={{ maxHeight: '80vh' }}>
      <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', width: widths.reduce((a, b) => a + b, 0) }}>
        <colgroup>
          {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50">
            {COLUMNS.map((col, i) => (
              <th
                key={col.key}
                className="relative border border-gray-200 px-2 py-2.5 font-semibold text-xs text-gray-600 whitespace-nowrap select-none"
                style={{ textAlign: col.center ? 'center' : 'left', width: widths[i] }}
              >
                <span className="block truncate">{col.label}</span>
                {/* Resize handle */}
                {i < COLUMNS.length - 1 && (
                  <span
                    onMouseDown={(e) => onMouseDown(e, i)}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400 transition-colors"
                    style={{ userSelect: 'none' }}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((item, idx) => {
            const rowClass =
              item.status === 'error'
                ? 'bg-red-50'
                : item.status === 'processing'
                ? 'bg-blue-50'
                : item.status === 'pending'
                ? 'bg-gray-50 opacity-60'
                : '';

            return (
              <tr key={item.id} className={`${rowClass} hover:bg-yellow-50 transition-colors`}>
                {/* STT */}
                <td className="border border-gray-100 px-2 py-2 text-center text-gray-500">{idx + 1}</td>

                {/* Tên file */}
                <td className="border border-gray-100 px-2 py-2 font-medium text-gray-800" title={item.file.name}>
                  <div className="truncate">{item.file.name}</div>
                </td>

                {item.result ? (
                  <>
                    <td className="border border-gray-100 px-2 py-2 text-gray-700">
                      <div className="truncate" title={item.result.coQuanBanHanh}>{item.result.coQuanBanHanh}</div>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-center text-gray-700 whitespace-nowrap">
                      {item.result.ngayThangNam}
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-gray-700">
                      <div className="truncate" title={item.result.soVanBan}>{item.result.soVanBan}</div>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-gray-700">
                      <div className="truncate" title={item.result.theLoai}>{item.result.theLoai}</div>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-gray-700" title={item.result.trichYeu}>
                      <div className="truncate">{item.result.trichYeu}</div>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-gray-700">
                      <div className="truncate" title={item.result.nguoiKy}>{item.result.nguoiKy}</div>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${item.result.banChinh === 'Bản chính' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                        {item.result.banChinh}
                      </span>
                    </td>
                    <td className="border border-gray-100 px-2 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${DOC_SECRET_COLORS[item.result.doMat] || 'bg-gray-100 text-gray-700'}`}>
                        {item.result.doMat}
                      </span>
                    </td>
                  </>
                ) : item.status === 'error' ? (
                  <td colSpan={8} className="border border-gray-100 px-2 py-2 text-red-500 text-center">
                    {item.error || 'Lỗi xử lý'}
                  </td>
                ) : (
                  <td colSpan={8} className="border border-gray-100 px-2 py-2 text-gray-400 text-center">
                    {item.status === 'processing' ? 'Đang xử lý...' : 'Chờ xử lý...'}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
