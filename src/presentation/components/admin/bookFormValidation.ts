import { isImageFile, isPdfFile } from '@/src/shared/utils';

export type FieldName =
  | 'title'
  | 'description'
  | 'price'
  | 'voiceId'
  | 'categoryIds'
  | 'authorIds'
  | 'coverFile'
  | 'pdfFile';

export type Errors = Partial<Record<FieldName, string>>;

/** Order used to focus the first invalid field on submit */
export const FIELD_ORDER: FieldName[] = [
  'coverFile',
  'pdfFile',
  'title',
  'description',
  'price',
  'voiceId',
  'categoryIds',
  'authorIds',
];

const MB = 1024 * 1024;

export const LIMITS = {
  title: 255,
  description: 2000,
  pdfBytes: 100 * MB,
  coverBytes: 5 * MB,
};

export const COVER_ACCEPT = 'image/jpeg,image/png,image/webp';

export interface FormState {
  title: string;
  description: string;
  price: string; // raw digits so an empty field is distinguishable from 0
  voiceId: number;
  categoryIds: number[];
  authorIds: number[];
}

interface ValidateInput {
  form: FormState;
  coverFile: File | null;
  pdfFile: File | null;
  hasExistingCover: boolean;
  requirePdf: boolean;
}

export const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')} ₫`;

export const getServerMessage = (error: unknown) => {
  const e = error as { response?: { data?: { message?: string } } };
  return (
    e?.response?.data?.message ||
    'Không thể lưu sách. Kiểm tra kết nối rồi thử lại.'
  );
};

export const validateBookForm = ({
  form,
  coverFile,
  pdfFile,
  hasExistingCover,
  requirePdf,
}: ValidateInput): Errors => {
  const errors: Errors = {};

  const title = form.title.trim();
  if (!title) errors.title = 'Nhập tiêu đề sách.';
  else if (title.length > LIMITS.title)
    errors.title = `Tiêu đề tối đa ${LIMITS.title} ký tự.`;

  const description = form.description.trim();
  if (!description) errors.description = 'Nhập mô tả sách.';
  else if (description.length > LIMITS.description)
    errors.description = `Mô tả tối đa ${LIMITS.description} ký tự.`;

  if (form.price === '')
    errors.price = 'Nhập giá sách. Nhập 0 nếu sách miễn phí.';
  else if (!/^\d+$/.test(form.price))
    errors.price = 'Giá sách phải là số không âm.';

  if (!form.voiceId) errors.voiceId = 'Chọn giọng đọc cho sách.';
  if (form.categoryIds.length === 0)
    errors.categoryIds = 'Chọn ít nhất một danh mục.';
  if (form.authorIds.length === 0)
    errors.authorIds = 'Chọn ít nhất một tác giả.';

  if (!coverFile && !hasExistingCover)
    errors.coverFile = 'Chọn ảnh bìa cho sách.';
  else if (coverFile && !isImageFile(coverFile))
    errors.coverFile = 'Ảnh bìa phải là file ảnh.';
  else if (coverFile && coverFile.size > LIMITS.coverBytes)
    errors.coverFile = 'Ảnh bìa tối đa 5 MB.';

  if (requirePdf && !pdfFile) errors.pdfFile = 'Chọn file PDF nội dung sách.';
  else if (pdfFile && !isPdfFile(pdfFile))
    errors.pdfFile = 'File phải có định dạng PDF.';
  else if (pdfFile && pdfFile.size > LIMITS.pdfBytes)
    errors.pdfFile = 'File PDF tối đa 100 MB.';

  return errors;
};
