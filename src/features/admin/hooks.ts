"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { AdminProfileForm, PlatformUser } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

/**
 * Whether the signed-in account has platform-admin privilege. Resolved by
 * probing the API (see api.isPlatformAdmin) and cached for the session — the
 * answer only changes when the backend's allow-list does.
 */
export function useIsPlatformAdmin() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.admin.isAdmin,
    queryFn: api.isPlatformAdmin,
    enabled: status === "authenticated",
    staleTime: Infinity,
    retry: false,
  });
}

export function usePlatformUsers() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: api.listPlatformUsers,
    enabled: status === "authenticated",
  });
}

export function usePlatformUser(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.admin.user(id),
    queryFn: () => api.getPlatformUser(id),
    enabled: status === "authenticated" && Boolean(id),
  });
}

/** Shared cache write for the three lifecycle actions, which all return the user. */
function useLifecycleAction(
  fn: (id: string) => Promise<PlatformUser>,
  message: string,
  { removes = false }: { removes?: boolean } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.users });
      if (removes) qc.removeQueries({ queryKey: queryKeys.admin.user(user.id) });
      else qc.setQueryData(queryKeys.admin.user(user.id), user);
      toast.success(message);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useSoftDeleteUser() {
  return useLifecycleAction(api.softDeletePlatformUser, "User suspended");
}

export function useRestoreUser() {
  return useLifecycleAction(api.restorePlatformUser, "User restored");
}

export function useHardDeleteUser() {
  return useLifecycleAction(api.hardDeletePlatformUser, "User permanently deleted", {
    removes: true,
  });
}

export function useClaimAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: AdminProfileForm) => api.claimAdminProfile(form),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.admin.profile, profile);
      toast.success("Admin profile saved");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateAdminProfileName(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.updateAdminProfileName(id, name),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.admin.profile, profile);
      toast.success("Admin profile updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
