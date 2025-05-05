import es from '../locales/es/common.json';

export function useT() {
  return (key: string) => {
    const keys = key.split('.');
    let value: unknown = es;
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return value as string;
  };
} 