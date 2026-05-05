"use client";

import { useCallback, useEffect, useState } from "react";
import { clearClientAccessToken, getAuthEventName, getClientAccessToken, setClientAccessToken } from "@/lib/supabase/client-auth";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyError, notifySuccess } from "@/lib/toast";
import { ApiRequestError } from "@/services/request-json";
import { getCurrentUserFromApi, signInWithPasswordFromApi, type AuthSessionProfile } from "@/services/auth";

type AuthStatus = "disabled" | "disconnected" | "loading" | "connected";

export function useAuthSession() {
  const [profile, setProfile] = useState<AuthSessionProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (hasSupabaseClientEnv() ? "loading" : "disabled"));

  const refreshProfile = useCallback(async () => {
    if (!hasSupabaseClientEnv()) {
      setProfile(null);
      setStatus("disabled");
      return null;
    }

    const accessToken = getClientAccessToken();
    if (!accessToken) {
      setProfile(null);
      setStatus("disconnected");
      return null;
    }

    setStatus("loading");

    try {
      const nextProfile = await getCurrentUserFromApi();
      setProfile(nextProfile);
      setStatus("connected");
      return nextProfile;
    } catch (error) {
      clearClientAccessToken();
      setProfile(null);
      setStatus("disconnected");

      if (!(error instanceof ApiRequestError && error.status === 401)) {
        notifyError("云端身份校验失败", "当前登录状态无法获取用户资料，请重新登录。", "auth-refresh-failed");
      }

      return null;
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const eventName = getAuthEventName();
    const handleAuthUpdated = () => {
      void refreshProfile();
    };

    window.addEventListener(eventName, handleAuthUpdated);
    return () => window.removeEventListener(eventName, handleAuthUpdated);
  }, [refreshProfile]);

  const connectWithAccessToken = useCallback(
    async (accessToken: string) => {
      if (!hasSupabaseClientEnv()) {
        notifyError("云端未配置", "当前环境没有配置 Supabase，无法连接账号。", "auth-disabled");
        return null;
      }

      const normalizedToken = accessToken.trim();
      if (!normalizedToken) {
        notifyError("请输入 Access Token", "请先粘贴 Supabase 登录态中的 access token。", "auth-empty-token");
        return null;
      }

      setClientAccessToken(normalizedToken);
      const nextProfile = await refreshProfile();

      if (nextProfile) {
        notifySuccess("云端账号已连接", nextProfile.email || "后续读写会携带当前用户身份。", "auth-connected");
      }

      return nextProfile;
    },
    [refreshProfile]
  );

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!hasSupabaseClientEnv()) {
      notifyError("云端未配置", "当前环境没有配置 Supabase，无法登录。", "auth-disabled");
      return null;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      notifyError("请输入邮箱和密码", "Supabase 登录需要邮箱和密码。", "auth-empty-password-login");
      return null;
    }

    setStatus("loading");

    try {
      const response = await signInWithPasswordFromApi(normalizedEmail, password);
      setClientAccessToken(response.accessToken);
      setProfile(response.profile);
      setStatus("connected");
      notifySuccess("云端账号已登录", response.profile.email || "后续读写会携带当前用户身份。", "auth-password-connected");
      return response.profile;
    } catch (error) {
      setStatus("disconnected");
      notifyError(
        "登录失败",
        error instanceof Error ? error.message : "请检查 Supabase 邮箱、密码和 Auth 配置。",
        "auth-password-login-failed"
      );
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearClientAccessToken();
    setProfile(null);
    setStatus(hasSupabaseClientEnv() ? "disconnected" : "disabled");
    notifySuccess("已断开云端账号", "本地数据仍可继续使用。", "auth-disconnected");
  }, []);

  return {
    profile,
    status,
    isConnected: status === "connected",
    isLoading: status === "loading",
    refreshProfile,
    connectWithAccessToken,
    signInWithPassword,
    disconnect
  };
}
