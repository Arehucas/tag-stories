import { create } from 'zustand';

interface ImageStore {
  originalImage: string | null;
  croppedImage: string | null;
  setOriginalImage: (img: string | null) => void;
  setCroppedImage: (img: string | null) => void;
  clear: () => void;
  phash: string | null;
  setPhash: (phash: string | null) => void;
}

export const useImageStore = create<ImageStore>((set: (fn: (state: ImageStore) => Partial<ImageStore>) => void) => ({
  originalImage: null,
  croppedImage: null,
  setOriginalImage: (img: string | null) => set(() => ({ originalImage: img })),
  setCroppedImage: (img: string | null) => set(() => ({ croppedImage: img })),
  clear: () => set(() => ({ originalImage: null, croppedImage: null })),
  phash: null,
  setPhash: (phash) => set(() => ({ phash })),
})); 