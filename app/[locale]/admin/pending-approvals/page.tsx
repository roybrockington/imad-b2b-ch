'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  account_id: number | null;
  created_at: string;
  roles?: string[];
}

interface Account {
  id: number;
  code: number;
  name: string;
}

export default function PendingApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountIdInputs, setAccountIdInputs] = useState<{ [key: number]: string }>({});
  const [accountSearchInputs, setAccountSearchInputs] = useState<{ [key: number]: string }>({});
  const [showDropdown, setShowDropdown] = useState<{ [key: number]: boolean }>({});
  const [approvingUserId, setApprovingUserId] = useState<number | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const debounceTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);

        // Check if user is Admin
        if (!user.roles || !user.roles.includes('Admin')) {
          router.push('/dashboard');
          return;
        }

        // Fetch pending users and accounts
        await Promise.all([fetchPendingUsers(), fetchAccounts()]);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach((userId) => {
        const ref = dropdownRefs.current[parseInt(userId)];
        if (ref && !ref.contains(event.target as Node)) {
          setShowDropdown((prev) => ({ ...prev, [parseInt(userId)]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up debounce timers
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }

      const data = await response.json();
      setPendingUsers(data);
    } catch (err) {
      setError('Failed to load pending users');
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      // Don't set error as accounts list is optional for manual input
    }
  };

  const handleApprove = async (userId: number) => {
    const accountId = accountIdInputs[userId];

    if (!accountId || accountId.trim() === '') {
      alert('Please enter an account ID');
      return;
    }

    setApprovingUserId(userId);
    setError('');

    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ account_id: parseInt(accountId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve user');
      }

      // Remove user from pending list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      setAccountIdInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[userId];
        return newInputs;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to approve user');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleAccountSearchChange = useCallback((userId: number, value: string) => {
    // Update input immediately for responsive UI
    setAccountSearchInputs(prev => ({
      ...prev,
      [userId]: value
    }));

    // Clear existing timer for this user
    if (debounceTimers.current[userId]) {
      clearTimeout(debounceTimers.current[userId]);
    }

    // Debounce the dropdown showing
    debounceTimers.current[userId] = setTimeout(() => {
      setShowDropdown(prev => ({
        ...prev,
        [userId]: value.length > 0
      }));
    }, 150); // 150ms debounce
  }, []);

  const handleAccountSelect = useCallback((userId: number, account: Account) => {
    // Clear debounce timer
    if (debounceTimers.current[userId]) {
      clearTimeout(debounceTimers.current[userId]);
    }

    setAccountIdInputs(prev => ({
      ...prev,
      [userId]: account.id.toString()
    }));
    setAccountSearchInputs(prev => ({
      ...prev,
      [userId]: account.name
    }));
    setShowDropdown(prev => ({
      ...prev,
      [userId]: false
    }));
  }, []);

  // Memoize filtered accounts for each user to avoid recalculation on every render
  const getFilteredAccounts = useCallback((userId: number): Account[] => {
    const searchTerm = accountSearchInputs[userId] || '';
    if (!searchTerm) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [accountSearchInputs, accounts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending User Approvals</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve newly registered users by assigning them to accounts
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {pendingUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No pending user approvals</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative" ref={(el) => { dropdownRefs.current[user.id] = el; }}>
                        <input
                          type="text"
                          value={accountSearchInputs[user.id] || ''}
                          onChange={(e) => handleAccountSearchChange(user.id, e.target.value)}
                          onFocus={() => {
                            if (accountSearchInputs[user.id]?.length > 0) {
                              setShowDropdown(prev => ({ ...prev, [user.id]: true }));
                            }
                          }}
                          placeholder="Search account name..."
                          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                          disabled={approvingUserId === user.id}
                        />
                        {showDropdown[user.id] && getFilteredAccounts(user.id).length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {getFilteredAccounts(user.id).map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleAccountSelect(user.id, account)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                <div className="font-medium text-gray-900">{account.name}</div>
                                <div className="text-sm text-gray-500">Acc: {account.code}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={approvingUserId === user.id}
                        className="bg-brand hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvingUserId === user.id ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
