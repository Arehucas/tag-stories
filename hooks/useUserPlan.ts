import useSWR from 'swr';

export function useUserPlan() {
  const { data, error } = useSWR('/api/user/plan', (url: string) => fetch(url).then(r => r.json()));
  return {
    plan: data?.plan,
    isPro: data?.plan === 'pro',
    loading: !data && !error,
    error,
  };
} 