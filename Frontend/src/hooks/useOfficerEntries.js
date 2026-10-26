import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * useOfficerEntries - Custom hook to manage Ward Officer entry reviews
 * Centralizes fetch, approve and reject logic away from the component
 */
const useOfficerEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/officer/pending');
      setEntries(res.data.entries || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/officer/drafts');
      setEntries(res.data.entries || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveEntry = async (entryId) => {
    try {
      await api.put(`/officer/${entryId}/approve`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Approval failed' };
    }
  };

  const rejectEntry = async (entryId, rejectionReason) => {
    try {
      await api.put(`/officer/${entryId}/reject`, { rejectionReason });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Rejection failed' };
    }
  };

  return { entries, loading, error, fetchPending, fetchDrafts, approveEntry, rejectEntry };
};

export default useOfficerEntries;
