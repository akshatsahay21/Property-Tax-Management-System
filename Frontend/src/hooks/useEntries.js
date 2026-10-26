import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * useEntries - Custom hook to manage all Inspector entries
 * Centralizes fetch, create, and resubmit logic away from the component
 */
const useEntries = () => {
  const [entries, setEntries] = useState([]);
  const [counts, setCounts] = useState({ submitted: 0, approved: 0, draft: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inspector');
      setEntries(res.data.entries || []);
      setCounts(res.data.counts || { submitted: 0, approved: 0, draft: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/inspector', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEntries();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create entry';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const resubmitEntry = async (entryId, formData) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/inspector/${entryId}/resubmit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEntries();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resubmit entry';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { entries, counts, loading, error, fetchEntries, createEntry, resubmitEntry };
};

export default useEntries;
