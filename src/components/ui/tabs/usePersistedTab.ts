'use client'

import { useCallback, useSyncExternalStore } from 'react'

const TAB_STORAGE_EVENT = 'mikeblocky-tab-storage'

export function usePersistedTab<TTab extends string>(
  storageKey: string,
  defaultTab: TTab,
  isValidTab: (value: string) => value is TTab
) {
  const getSnapshot = useCallback(() => {
    const storedTab = window.localStorage.getItem(storageKey)
    return storedTab && isValidTab(storedTab) ? storedTab : defaultTab
  }, [defaultTab, isValidTab, storageKey])

  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStorage = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== storageKey) return
      onStoreChange()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(TAB_STORAGE_EVENT, handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(TAB_STORAGE_EVENT, handleStorage)
    }
  }, [storageKey])

  const activeTab = useSyncExternalStore(subscribe, getSnapshot, () => defaultTab)

  const setActiveTab = (tab: TTab) => {
    window.localStorage.setItem(storageKey, tab)
    window.dispatchEvent(new Event(TAB_STORAGE_EVENT))
  }

  return [activeTab, setActiveTab] as const
}
