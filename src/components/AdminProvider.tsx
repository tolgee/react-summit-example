import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminKey: string;
  setAdminKey: (key: string) => void;
  addOption: (option: string) => Promise<boolean>;
  deleteOption: (option: string) => Promise<boolean>;
  resetDb: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminKey, setAdminKey] = useState<string>('');

  // Check if admin=true is in query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    setIsAdmin(adminParam === 'true');

    // Load the admin key from local storage
    const savedKey = localStorage.getItem('adminKey');
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  // Save the admin key to local storage when it changes
  useEffect(() => {
    if (adminKey) {
      localStorage.setItem('adminKey', adminKey);
    }
  }, [adminKey]);

  const addOption = async (option: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({ option })
      });

      if (!response.ok) {
        console.error('Error adding option:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding option:', error);
      return false;
    }
  };

  const deleteOption = async (option: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/options/${encodeURIComponent(option)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': adminKey
        }
      });

      if (!response.ok) {
        console.error('Error deleting option:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting option:', error);
      return false;
    }
  };

  const resetDb = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'X-Admin-Key': adminKey
        }
      });

      if (!response.ok) {
        console.error('Error resetting database:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      return false;
    }
  };

  const value = {
    isAdmin,
    adminKey,
    setAdminKey,
    addOption,
    deleteOption,
    resetDb
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};