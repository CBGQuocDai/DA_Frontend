export const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

export const isImageFile = (file: File) => file.type.startsWith('image/');
