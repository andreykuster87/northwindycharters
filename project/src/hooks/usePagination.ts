// src/hooks/usePagination.ts
// Hook reutilizável de paginação — aplica-se a qualquer lista em memória.
// Quando a arquitectura evoluir para queries paginadas no Supabase,
// basta trocar `items` por uma query com .range(from, to).
import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(1);

  // Reset para página 1 sempre que a lista muda (ex: após filtro/search)
  useEffect(() => { setPage(1); }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage   = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    paged,
    page: safePage,
    totalPages,
    totalItems: items.length,
    pageSize,
    setPage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    prev: () => setPage(p => Math.max(1, p - 1)),
    next: () => setPage(p => Math.min(totalPages, p + 1)),
    from: (safePage - 1) * pageSize + 1,
    to:   Math.min(safePage * pageSize, items.length),
  };
}
