export interface OcrResult {
  coQuanBanHanh: string;
  ngayThangNam: string;
  soVanBan: string;
  theLoai: string;
  trichYeu: string;
  nguoiKy: string;
  banChinh: string;
  doMat: string;
}

export type FileStatus = 'pending' | 'processing' | 'done' | 'error';

export interface FileItem {
  id: string;
  file: File;
  status: FileStatus;
  result?: OcrResult;
  error?: string;
}
