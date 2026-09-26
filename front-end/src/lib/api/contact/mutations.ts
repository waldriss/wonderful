import { useMutation } from '@tanstack/react-query';
import { submitContact } from './clientRequests';
import type { SubmitContactDto } from './types';

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: SubmitContactDto) => submitContact(data),
  });
}
