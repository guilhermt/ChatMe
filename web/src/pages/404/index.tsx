import { NotFound } from '@/modules/404';
import { MainLayout } from '@/components/MainLayout';

export const NotFoundPage = () => (
  <MainLayout>
    <NotFound />
  </MainLayout>
);
