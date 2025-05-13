'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import styles from './admin.module.css';

interface ProviderURL {
  id: string;
  url: string;
  name: string;
  category: string;
  lastUpdated: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [urls, setUrls] = useState<ProviderURL[]>([]);
  const [newUrl, setNewUrl] = useState({ url: '', name: '', category: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user?.email?.endsWith('@clearcaresearch.com')) {
      window.location.href = '/';
    }
  }, [user, loading]);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    if (!db) {
      setError('Firebase is not initialized');
      setIsLoading(false);
      return;
    }

    try {
      const urlsCollection = collection(db, 'providerUrls');
      const snapshot = await getDocs(urlsCollection);
      const urlsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProviderURL));
      setUrls(urlsList);
    } catch (err) {
      setError('Failed to load URLs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!db) {
      setError('Firebase is not initialized');
      return;
    }

    try {
      const urlDoc = doc(collection(db, 'providerUrls'));
      await setDoc(urlDoc, {
        ...newUrl,
        lastUpdated: new Date().toISOString()
      });
      setSuccess('URL added successfully');
      setNewUrl({ url: '', name: '', category: '' });
      loadUrls();
    } catch (err) {
      setError('Failed to add URL');
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) {
      setError('Firebase is not initialized');
      return;
    }

    try {
      await deleteDoc(doc(db, 'providerUrls', id));
      setSuccess('URL deleted successfully');
      loadUrls();
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  if (!user.email?.endsWith('@clearcaresearch.com')) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1>Provider URL Management</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Provider Name:</label>
          <input
            type="text"
            id="name"
            value={newUrl.name}
            onChange={(e) => setNewUrl({ ...newUrl, name: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="url">Provider URL:</label>
          <input
            type="url"
            id="url"
            value={newUrl.url}
            onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={newUrl.category}
            onChange={(e) => setNewUrl({ ...newUrl, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            <option value="Vaccinations">Vaccinations</option>
            <option value="Imaging">Imaging</option>
            <option value="Lab Tests">Lab Tests</option>
            <option value="Primary Care">Primary Care</option>
          </select>
        </div>

        <button type="submit" className={styles.button}>Add Provider URL</button>
      </form>

      <div className={styles.urlList}>
        <h2>Existing Provider URLs</h2>
        {isLoading ? (
          <div>Loading URLs...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>URL</th>
                <th>Category</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td>{url.name}</td>
                  <td>
                    <a href={url.url} target="_blank" rel="noopener noreferrer">
                      {url.url}
                    </a>
                  </td>
                  <td>{url.category}</td>
                  <td>{new Date(url.lastUpdated).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(url.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 