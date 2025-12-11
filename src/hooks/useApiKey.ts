"use client";

import { useEffect, useState } from "react";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const res = await fetch("/api/user/apikey/full");
      const data = await res.json();
      setApiKey(data.key || null);
    } catch {
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  };

  return { apiKey, loading, refetch: fetchApiKey };
}
