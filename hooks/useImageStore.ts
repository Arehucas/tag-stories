import { create } from 'zustand';

interface ImageStore {
  originalImage: string | null;
  croppedImage: string | null;
  colorCode: { r: number; g: number; b: number }[];
  setOriginalImage: (img: string | null) => void;
  setCroppedImage: (img: string | null) => void;
  setColorCode: (code: { r: number; g: number; b: number }[]) => void;
  clear: () => void;
}

export const useImageStore = create<ImageStore>((set: (fn: (state: ImageStore) => Partial<ImageStore>) => void) => ({
  originalImage: null,
  croppedImage: null,
  colorCode: [],
  setOriginalImage: (img: string | null) => set(() => ({ originalImage: img })),
  setCroppedImage: (img: string | null) => set(() => ({ croppedImage: img })),
  setColorCode: (code) => set(() => ({ colorCode: code })),
  clear: () => set(() => ({ originalImage: null, croppedImage: null, colorCode: [] })),
})); 