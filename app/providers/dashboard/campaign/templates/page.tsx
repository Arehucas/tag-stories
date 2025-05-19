import { Suspense } from 'react';
import SelectTemplateClient from './SelectTemplateClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SelectTemplateClient />
    </Suspense>
  );
} 