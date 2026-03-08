'use client';

import { OcrResult } from '@/types/ocr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OcrResultCardProps {
  result: OcrResult;
  fileName?: string;
}

const DOC_SECRET_COLORS: Record<string, string> = {
  'Thường': 'bg-green-100 text-green-800 border-green-200',
  'Không mật': 'bg-green-100 text-green-800 border-green-200',
  'Mật': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Tối mật': 'bg-orange-100 text-orange-800 border-orange-200',
  'Tuyệt mật': 'bg-red-100 text-red-800 border-red-200',
};

function getSecretColor(val: string): string {
  return DOC_SECRET_COLORS[val] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

const fields: { label: string; key: keyof OcrResult }[] = [
  { label: 'Cơ quan ban hành', key: 'coQuanBanHanh' },
  { label: 'Ngày tháng năm', key: 'ngayThangNam' },
  { label: 'Số văn bản', key: 'soVanBan' },
  { label: 'Thể loại văn bản', key: 'theLoai' },
  { label: 'Trích yếu', key: 'trichYeu' },
  { label: 'Người ký', key: 'nguoiKy' },
  { label: 'Bản chính / Bản sao', key: 'banChinh' },
  { label: 'Độ mật', key: 'doMat' },
];

export default function OcrResultCard({ result, fileName }: OcrResultCardProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {fileName ? (
            <span className="truncate">{fileName}</span>
          ) : (
            'Kết quả OCR'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-3">
          {fields.map(({ label, key }) => {
            const value = result[key];
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-gray-500 sm:w-40 shrink-0">{label}</dt>
                <dd className="text-sm text-gray-900 font-medium">
                  {key === 'doMat' ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getSecretColor(value as string)}`}>
                      {value}
                    </span>
                  ) : key === 'banChinh' ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${value === 'Bản chính' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {value}
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
