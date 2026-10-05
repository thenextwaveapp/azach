import { useQuery } from '@tanstack/react-query';
import { lookbookService } from '@/services/lookbookService';

export const useLookbookImages = () => {
  return useQuery({
    queryKey: ['lookbook-images'],
    queryFn: lookbookService.getAll,
  });
};
