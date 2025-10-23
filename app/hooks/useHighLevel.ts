import { useState } from 'react';

interface ContactData {
  name: string;
  email: string;
  phone?: string;
}

interface UseHighLevelReturn {
  createContact: (data: ContactData) => Promise<{ success: boolean; contact?: any }>;
  loading: boolean;
  error: string | null;
}

export const useHighLevel = (): UseHighLevelReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContact = async ({ name, email, phone }: ContactData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return { success: true, contact: result.contact };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createContact, loading, error };
};

