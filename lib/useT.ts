import es from '../locales/es/common.json';

export function useT() {
  return (key: string) => {
    const keys = key.split('.');
    let value: any = es;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value;
  };
} 