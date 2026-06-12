import { useState, useEffect } from 'react';
import { propertiesApi } from '../services/api';

export function useProperties(params) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    propertiesApi.list(params)
      .then((res) => setProperties(res.data.results || res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading, error };
}

export function useProperty(id) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertiesApi.get(id)
      .then((res) => setProperty(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { property, loading, error };
}
