"use client";

const ACCESS_TOKEN_KEY = "kaoyan-study:access-token";
const AUTH_EVENT_NAME = "kaoyan-study:auth-updated";

export function getClientAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return value && value.trim().length > 0 ? value : null;
}

export function hasClientAccessToken() {
  return Boolean(getClientAccessToken());
}

export function setClientAccessToken(accessToken: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedToken = accessToken.trim();
  if (!normalizedToken) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, normalizedToken);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearClientAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function getClientAuthHeaders() {
  const accessToken = getClientAccessToken();

  if (!accessToken) {
    return {} as Record<string, string>;
  }

  return {
    Authorization: `Bearer ${accessToken}`
  } satisfies Record<string, string>;
}

export function getAuthEventName() {
  return AUTH_EVENT_NAME;
}
