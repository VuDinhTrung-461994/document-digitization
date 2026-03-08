import { NextRequest, NextResponse } from 'next/server';
import { OcrResult } from '@/types/ocr';

const OCR_API_URL = 'https://ocop-oct.digipro.com.vn/ocr/van-ban';

interface OcrApiResponse {
  co_quan_ban_hanh: string;
  ngay_thang_nam: string;
  so_van_ban: string;
  the_loai_van_ban: string;
  trich_yeu_van_ban: string;
  nguoi_ky_van_ban: string;
  ban_chinh_ban_sao: string;
  do_mat: string;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  let res: Response;
  try {
    res = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: formData,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Không thể kết nối đến OCR server';
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  if (!res.ok) {
    let message = `OCR server trả về lỗi ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) message = err.detail;
    } catch {}
    return NextResponse.json({ error: message }, { status: res.status });
  }

  const text = await res.text();
  if (!text || text.trim() === '') {
    return NextResponse.json({ error: 'OCR server trả về response rỗng' }, { status: 502 });
  }

  let data: OcrApiResponse;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: `OCR server trả về dữ liệu không hợp lệ: ${text.slice(0, 120)}` }, { status: 502 });
  }

  const result: OcrResult = {
    coQuanBanHanh: data.co_quan_ban_hanh ?? '',
    ngayThangNam: data.ngay_thang_nam ?? '',
    soVanBan: data.so_van_ban ?? '',
    theLoai: data.the_loai_van_ban ?? '',
    trichYeu: data.trich_yeu_van_ban ?? '',
    nguoiKy: data.nguoi_ky_van_ban ?? '',
    banChinh: data.ban_chinh_ban_sao ?? '',
    doMat: data.do_mat ?? '',
  };

  return NextResponse.json(result);
}
