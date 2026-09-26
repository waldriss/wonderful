import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, updateAvatar, updateAddress } from './clientRequests';
import { userKeys } from './queries';
import type { UpdateProfileDto, UpdateAvatarDto, AddressDto, UserProfile } from './types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<UserProfile>(userKeys.profile(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAvatarDto) => updateAvatar(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<UserProfile>(userKeys.profile(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressDto) => updateAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
}
