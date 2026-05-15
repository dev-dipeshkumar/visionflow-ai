import { useState, useMemo } from 'react'
import { useDebounce } from './use-debounce'

/**
 * Provides a debounced search state for filtering large lists.
 * Returns [searchInput, debouncedSearch, setSearchInput].
 * - searchInput: the raw input value (for controlled input binding)
 * - debouncedSearch: the debounced value (for filtering logic)
 * - setSearchInput: the setter for the raw input
 */
export function useDebouncedSearch(delay: number = 250) {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, delay)

  return useMemo(
    () => [searchInput, debouncedSearch, setSearchInput] as const,
    [searchInput, debouncedSearch, setSearchInput]
  )
}
