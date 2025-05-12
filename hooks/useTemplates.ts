import useSWR from 'swr';

export function useTemplates() {
  const { data, error, isLoading } = useSWR('/api/templates', (url: string) => fetch(url).then(r => r.json()));
  return {
    templates: data || [],
    loading: isLoading,
    error,
  };
} 