"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const localDataKeys = {
  tasks: "kaoyan-study:tasks",
  mistakes: "kaoyan-study:mistakes",
  knowledge: "kaoyan-study:knowledge",
  attendance: "kaoyan-study:attendance",
  background: "kaoyan-study:background",
  pomodoro: "kaoyan-study:pomodoro"
} as const;

function readLocalData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeLocalData<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(`${key}-updated`));
  } catch {
    // ignore localStorage write failures and keep the in-memory state usable
  }
}

export function setLocalCollection<T>(key: string, items: T[]) {
  writeLocalData(key, items);
}

export function getLocalCollection<T>(key: string, fallback: T[] = []) {
  return readLocalData<T[]>(key, fallback);
}

type ReviveCollection<T> = (items: T[]) => T[];

interface UsePersistentCollectionOptions<T> {
  seedData?: T[];
  revive?: ReviveCollection<T>;
  preferEmpty?: boolean;
  hydrateFromLocal?: boolean;
}

interface PersistentCollectionMeta {
  isReady: boolean;
  hasStoredData: boolean;
  hasLocalSnapshot: boolean;
  seedCollection: () => void;
  restoreLocalSnapshot: () => void;
}

function cloneCollection<T>(items: T[]) {
  return [...items];
}

export function usePersistentCollection<T>(
  key: string,
  options: UsePersistentCollectionOptions<T> = {}
): [T[], Dispatch<SetStateAction<T[]>>, PersistentCollectionMeta] {
  const { seedData = [], revive, preferEmpty = false, hydrateFromLocal = true } = options;
  const reviveCollection = useCallback(
    (items: T[]) => (revive ? revive(cloneCollection(items)) : cloneCollection(items)),
    [revive]
  );
  const seedCollectionValue = useMemo(() => reviveCollection(seedData), [reviveCollection, seedData]);
  const initialItems = useMemo(() => {
    if (preferEmpty || !hydrateFromLocal) {
      return [] as T[];
    }

    return seedCollectionValue;
  }, [hydrateFromLocal, preferEmpty, seedCollectionValue]);

  const [items, setItemsState] = useState<T[]>(initialItems);
  const [isReady, setIsReady] = useState(false);
  const localSnapshotRef = useRef<T[] | null>(null);
  const hasLocalSnapshotRef = useRef(false);
  const persistEnabledRef = useRef(false);

  const setItems = useCallback<Dispatch<SetStateAction<T[]>>>((nextValue) => {
    persistEnabledRef.current = true;
    setItemsState(nextValue);
  }, []);

  const seedCollection = useCallback(() => {
    setItems(seedCollectionValue);
  }, [seedCollectionValue, setItems]);

  const restoreLocalSnapshot = useCallback(() => {
    if (localSnapshotRef.current) {
      setItems(localSnapshotRef.current);
      return;
    }

    if (!preferEmpty && seedCollectionValue.length > 0) {
      setItems(seedCollectionValue);
      return;
    }

    setItems([]);
  }, [preferEmpty, seedCollectionValue, setItems]);

  useEffect(() => {
    const storedItems = readLocalData<T[] | null>(key, null);

    if (storedItems && Array.isArray(storedItems)) {
      localSnapshotRef.current = reviveCollection(storedItems);
      hasLocalSnapshotRef.current = true;

      if (hydrateFromLocal) {
        persistEnabledRef.current = true;
        setItemsState(localSnapshotRef.current);
      }
    } else {
      hasLocalSnapshotRef.current = false;
      localSnapshotRef.current = null;
      persistEnabledRef.current = hydrateFromLocal;

      if (!hydrateFromLocal) {
        setItemsState([]);
      } else if (!preferEmpty && seedCollectionValue.length > 0) {
        setItemsState(seedCollectionValue);
      } else if (preferEmpty) {
        setItemsState([]);
      }
    }

    setIsReady(true);
  }, [hydrateFromLocal, key, preferEmpty, reviveCollection, seedCollectionValue]);

  useEffect(() => {
    if (!isReady || !persistEnabledRef.current) {
      return;
    }

    writeLocalData(key, items);
  }, [isReady, items, key]);

  const meta = useMemo<PersistentCollectionMeta>(
    () => ({
      isReady,
      hasStoredData: hasLocalSnapshotRef.current,
      hasLocalSnapshot: hasLocalSnapshotRef.current,
      seedCollection,
      restoreLocalSnapshot
    }),
    [isReady, restoreLocalSnapshot, seedCollection]
  );

  return [items, setItems, meta];
}

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => readLocalData<T>(key, initialValue));

  const setPersistentState = useCallback(
    (value: SetStateAction<T>) => {
      setState((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        writeLocalData(key, nextValue);
        return nextValue;
      });
    },
    [key]
  );

  useEffect(() => {
    const handleSync = () => {
      const current = readLocalData<T>(key, initialValue);
      setState(current);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        handleSync();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(`${key}-updated`, handleSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(`${key}-updated`, handleSync);
    };
  }, [initialValue, key]);

  return [state, setPersistentState];
}
