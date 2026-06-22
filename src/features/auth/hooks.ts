"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/lib/query/keys";
import type { AuthSession } from "@/features/auth/schemas";

/** Invalidate the per-account caches that a fresh sign-in should re-resolve. */
function useOnAuthenticated() {
  const queryClient = useQueryClient();
  const applySession = useAuthStore((s) => s.applySession);
  return (session: AuthSession) => {
    applySession(session);
    queryClient.invalidateQueries({ queryKey: queryKeys.business.mine });
    queryClient.invalidateQueries({ queryKey: queryKeys.setup.status });
  };
}

export function useRequestEmailCode() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestEmailCode(email),
  });
}

export function useVerifyCode() {
  const onAuthenticated = useOnAuthenticated();
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyCode(email, code),
    onSuccess: onAuthenticated,
  });
}

export function useSignInPassword() {
  const onAuthenticated = useOnAuthenticated();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signInWithPassword(email, password),
    onSuccess: onAuthenticated,
  });
}

export function useSignInGoogle() {
  const onAuthenticated = useOnAuthenticated();
  return useMutation({
    mutationFn: (idToken: string) => authApi.signInWithGoogle(idToken),
    onSuccess: onAuthenticated,
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: ({
      userId,
      email,
      newPassword,
    }: {
      userId: string;
      email: string;
      newPassword: string;
    }) => authApi.createPassword(userId, email, newPassword),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}
