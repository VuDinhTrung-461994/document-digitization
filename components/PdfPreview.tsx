'use client';

import { useEffect, useState } from 'react';

interface PdfPreviewProps {
  file: File;
  className?: string;
}

export default function PdfPreview({ file, className = '' }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // #toolbar=0&navpanes=0 ẩn thanh công cụ trang của browser PDF viewer
    const objectUrl = URL.createObjectURL(file) + '#toolbar=0&navpanes=0';
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;

  return (
    <iframe
      src={url}
      title={file.name}
      className={`w-full h-full border-0 ${className}`}
    />
  );
}
