"use client";

import { useMutation } from "@tanstack/react-query";
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

function mergeUser(user: User, patch: { firstName?: string; lastName?: string | null }): User {
  return {
    ...user,
    firstName: patch.firstName ?? user.firstName,
    lastName: patch.lastName === undefined ? user.lastName : patch.lastName,
  };
}
