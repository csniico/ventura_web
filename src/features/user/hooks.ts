"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import { useAuthStore } from "@/features/auth/store";
import { errorMessage } from "@/lib/api/message";
import type { User } from "@/features/auth/schemas";

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (patch: { firstName?: string; lastName?: string | null }) => {
      if (!user) throw new Error("Not signed in");
      return api.updateProfile(user.id, patch).then((updated) => updated ?? mergeUser(user, patch));
    },
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateAvatar() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (patch: { avatarUrl: string | null; avatarKey: string | null }) => {
      if (!user) throw new Error("Not signed in");
      return api
        .updateAvatar(user.id, patch)
        .then((updated) => updated ?? ({ ...user, ...patch } as User));
    },
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Photo updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

/* ---- Account & security ---- */

export function useHasPassword() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["user", "has-password", user?.id],
    queryFn: () => api.getHasPassword(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
}

/** Set (first time) or change an existing password, based on `hasPassword`. */
export function useSavePassword(hasPassword: boolean) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: { oldPassword?: string; newPassword: string }) => {
      if (!user) throw new Error("Not signed in");
      return hasPassword
        ? api.changePassword(user.id, user.email, form.oldPassword ?? "", form.newPassword)
        : api.setPassword(user.id, user.email, form.newPassword);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "has-password"] });
      toast.success(hasPassword ? "Password changed" : "Password set");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useRequestEmailChange() {
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: (newEmail: string) => {
      if (!user) throw new Error("Not signed in");
      return api.requestEmailChange(user.id, newEmail);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useConfirmEmailChange() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (code: string) => {
      if (!user) throw new Error("Not signed in");
      return api.confirmEmailChange(user.id, code);
    },
    onSuccess: (updated) => {
      if (updated) setUser(updated);
      toast.success("Email updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteAccount() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Not signed in");
      return api.deleteAccount(user.id);
    },
    onSuccess: () => {
      clear();
      qc.clear();
      toast.success("Account deleted");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useLinkGoogle() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: { googleId: string; firstName?: string; lastName?: string; avatarUrl?: string }) => {
      if (!user) throw new Error("Not signed in");
      return api.linkGoogle({ email: user.email, ...payload });
    },
    onSuccess: (updated) => {
      if (updated) setUser(updated);
      toast.success("Google account linked");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

function mergeUser(user: User, patch: { firstName?: string; lastName?: string | null }): User {
  return {
    ...user,
    firstName: patch.firstName ?? user.firstName,
    lastName: patch.lastName === undefined ? user.lastName : patch.lastName,
  };
}
