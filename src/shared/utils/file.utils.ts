export const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

export const isImageFile = (file: File) => file.type.startsWith('image/');

/** Đọc thời lượng (giây) của file audio bằng cách cho trình duyệt nạp metadata của nó. */
export const getAudioDuration = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const settle = (duration?: number) => {
      URL.revokeObjectURL(url);
      if (duration && Number.isFinite(duration)) resolve(duration);
      else reject(new Error('Không đọc được thời lượng của file audio'));
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => settle(audio.duration);
    audio.onerror = () => settle();
    audio.src = url;
  });
