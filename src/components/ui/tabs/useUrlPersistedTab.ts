'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { usePersistedTab } from './usePersistedTab'

const TAB_URL_EVENT = 'mikeblocky-tab-url'

function subscribeToUrlChange(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange)
  window.addEventListener(TAB_URL_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('popstate', onStoreChange)
    window.removeEventListener(TAB_URL_EVENT, onStoreChange)
  }
}

export function useUrlPersistedTab<TTab extends string>(
  storageKey: string,
  defaultTab: TTab,
  isValidTab: (value: string) => value is TTab
) {
  const [storedTab, setStoredTab] = usePersistedTab(storageKey, defaultTab, isValidTab)
  const getSearch = useCallback(() => window.location.search, [])
  const search = useSyncExternalStore(subscribeToUrlChange, getSearch, () => '')
  const tabParam = new URLSearchParams(search).get('tab')
  const activeTab = tabParam && isValidTab(tabParam) ? tabParam : storedTab

  const setActiveTab = (tab: TTab) => {
    setStoredTab(tab)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', tab)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    window.dispatchEvent(new Event(TAB_URL_EVENT))
  }

  return [activeTab, setActiveTab] as const
}
