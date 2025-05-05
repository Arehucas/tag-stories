import { create } from 'zustand';

interface Provider {
  logo_url?: string;
  instagram_handle?: string;
  [key: string]: any;
}

interface ProviderStore {
  provider: Provider | null;
  setProvider: (provider: Provider) => void;
  clear: () => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
  clear: () => set({ provider: null }),
})); 