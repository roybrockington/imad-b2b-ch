'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';
import { Pencil, X, Check, Trash2, MoreHorizontal } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface Region {
  id: number;
  code: number;
  name: string;
}

interface Account {
  id: number;
  code: number;
  name: string;
  region_id: number;
  region?: Region;
}

interface User {
  id: number;
  name: string;
  email: string;
  account_id: number | null;
  account?: Account;
  created_at: string;
  roles?: Role[];
}

type RoleCategory = 'admin' | 'staff' | 'customer' | 'unassigned';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory>('customer');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [editingAccountUserId, setEditingAccountUserId] = useState<number | null>(null);
  const [userRegionSelections, setUserRegionSelections] = useState<{ [key: number]: number | null }>({});
  const [accountSearchInputs, setAccountSearchInputs] = useState<{ [key: number]: string }>({});
  const [accountIdInputs, setAccountIdInputs] = useState<{ [key: number]: string }>({});
  const [showAccountDropdown, setShowAccountDropdown] = useState<{ [key: number]: boolean }>({});
  const [updatingAccountUserId, setUpdatingAccountUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
  const [expandedActionsUserId, setExpandedActionsUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
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

        await Promise.all([fetchUsers(), fetchRegions(), fetchAccounts()]);
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
          setShowAccountDropdown((prev) => ({ ...prev, [parseInt(userId)]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    }
  };

  const fetchRegions = async () => {
    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch regions');
      }

      const data = await response.json();
      setRegions(data);
    } catch (err) {
      console.error('Failed to load regions:', err);
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
    }
  };

  // Categorize users by role and filter by search query
  const categorizedUsers = useMemo(() => {
    const categories = {
      admin: [] as User[],
      staff: [] as User[],
      customer: [] as User[],
      unassigned: [] as User[],
    };

    // Filter users by search query first
    const filteredUsers = users.filter((user) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const matchesName = user.name.toLowerCase().includes(query);
      const matchesEmail = user.email.toLowerCase().includes(query);
      const matchesAccount = user.account?.name?.toLowerCase().includes(query) || false;

      return matchesName || matchesEmail || matchesAccount;
    });

    filteredUsers.forEach((user) => {
      const roles = user.roles || [];
      const roleNames = roles.map(role => role.name);

      if (roleNames.includes('Admin')) {
        categories.admin.push(user);
      } else if (roleNames.includes('Staff')) {
        categories.staff.push(user);
      } else if (roleNames.includes('Customer') && user.account_id != null) {
        categories.customer.push(user);
      } else {
        categories.unassigned.push(user);
      }
    });

    return categories;
  }, [users, searchQuery]);

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

  const getRoleBadgeColor = (category: RoleCategory) => {
    switch (category) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: RoleCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryCount = (category: RoleCategory) => {
    return categorizedUsers[category].length;
  };

  // When searching, show all matching users regardless of selected category tab
  const activeUsers = useMemo(() => {
    if (searchQuery.trim()) {
      return [
        ...categorizedUsers.admin,
        ...categorizedUsers.staff,
        ...categorizedUsers.customer,
        ...categorizedUsers.unassigned,
      ];
    }
    return categorizedUsers[selectedCategory];
  }, [categorizedUsers, selectedCategory, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return activeUsers.slice(startIndex, endIndex);
  }, [activeUsers, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(activeUsers.length / ITEMS_PER_PAGE);
  }, [activeUsers]);

  const getUserCategory = (user: User): RoleCategory => {
    const roleNames = (user.roles || []).map(r => r.name);
    if (roleNames.includes('Admin')) return 'admin';
    if (roleNames.includes('Staff')) return 'staff';
    if (roleNames.includes('Customer') && user.account_id != null) return 'customer';
    return 'unassigned';
  };

  // Reset to page 1 when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleEditRole = (user: User) => {
    const currentRole = user.roles && user.roles.length > 0 ? user.roles[0].name : '';
    setEditingUserId(user.id);
    setEditingRole(currentRole);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole('');
  };

  const handleSaveRole = async (userId: number) => {
    if (!editingRole) {
      alert('Please select a role');
      return;
    }

    setUpdatingUserId(userId);
    setError('');

    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ role: editingRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role');
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers(users.map(user =>
        user.id === userId ? data.user : user
      ));

      setEditingUserId(null);
      setEditingRole('');
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Account editing handlers
  const handleEditAccount = (user: User) => {
    setEditingAccountUserId(user.id);
    setAccountSearchInputs(prev => ({
      ...prev,
      [user.id]: user.account?.name || ''
    }));
    setAccountIdInputs(prev => ({
      ...prev,
      [user.id]: user.account_id?.toString() || ''
    }));
    // Initialize region selection to null (user must select)
    setUserRegionSelections(prev => ({
      ...prev,
      [user.id]: null
    }));
  };

  const handleCancelAccountEdit = () => {
    setEditingAccountUserId(null);
    setAccountSearchInputs({});
    setAccountIdInputs({});
    setShowAccountDropdown({});
    setUserRegionSelections({});
  };

  const handleAccountSearchChange = useCallback((userId: number, value: string) => {
    setAccountSearchInputs(prev => ({
      ...prev,
      [userId]: value
    }));

    if (debounceTimers.current[userId]) {
      clearTimeout(debounceTimers.current[userId]);
    }

    debounceTimers.current[userId] = setTimeout(() => {
      setShowAccountDropdown(prev => ({
        ...prev,
        [userId]: true
      }));
    }, 150);
  }, []);

  const handleAccountSelect = useCallback((userId: number, account: Account) => {
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
    setShowAccountDropdown(prev => ({
      ...prev,
      [userId]: false
    }));
  }, []);

  const getFilteredAccounts = useCallback((userId: number): Account[] => {
    const searchTerm = accountSearchInputs[userId] || '';
    const selectedRegionId = userRegionSelections[userId];

    if (!searchTerm) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter accounts by search term and optionally by region
    return accounts.filter((account: any) => {
      const matchesSearch = account.name.toLowerCase().includes(lowerSearchTerm);
      const matchesRegion = selectedRegionId === null || account.region_id === selectedRegionId;
      return matchesSearch && matchesRegion;
    });
  }, [accountSearchInputs, accounts, userRegionSelections]);

  const handleSaveAccount = async (userId: number) => {
    const accountId = accountIdInputs[userId];

    if (!accountId || accountId.trim() === '') {
      alert('Please select an account');
      return;
    }

    setUpdatingAccountUserId(userId);
    setError('');

    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/account`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ account_id: parseInt(accountId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account');
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers(users.map(user =>
        user.id === userId ? data.user : user
      ));

      setEditingAccountUserId(null);
      setAccountSearchInputs({});
      setAccountIdInputs({});
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setUpdatingAccountUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setDeletingUserId(userId);
    setError('');

    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== userId));
      setConfirmDeleteUserId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all users by role category
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(['customer', 'staff', 'admin', 'unassigned'] as RoleCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category)} ({getCategoryCount(category)})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {activeUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No {selectedCategory} users found</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingAccountUserId === user.id ? (
                        <select
                          value={userRegionSelections[user.id] ?? ''}
                          onChange={(e) => {
                            const regionId = e.target.value ? parseInt(e.target.value) : null;
                            setUserRegionSelections(prev => ({
                              ...prev,
                              [user.id]: regionId
                            }));
                            // Clear account selection when region changes
                            setAccountSearchInputs(prev => ({
                              ...prev,
                              [user.id]: ''
                            }));
                            setAccountIdInputs(prev => ({
                              ...prev,
                              [user.id]: ''
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                          disabled={updatingAccountUserId === user.id}
                        >
                          <option value="">Select Region</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {user.account?.region?.name || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingAccountUserId === user.id ? (
                          <>
                            <div className="relative flex-1" ref={(el) => { dropdownRefs.current[user.id] = el; }}>
                              <input
                                type="text"
                                value={accountSearchInputs[user.id] || ''}
                                onChange={(e) => handleAccountSearchChange(user.id, e.target.value)}
                                onFocus={() => {
                                  if (accountSearchInputs[user.id]?.length > 0) {
                                    setShowAccountDropdown(prev => ({ ...prev, [user.id]: true }));
                                  }
                                }}
                                placeholder={userRegionSelections[user.id] ? "Search account name..." : "Select a region first..."}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm disabled:bg-gray-100"
                                disabled={updatingAccountUserId === user.id || !userRegionSelections[user.id]}
                              />
                              {showAccountDropdown[user.id] && getFilteredAccounts(user.id).length > 0 && (
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
                            <button
                              onClick={() => handleSaveAccount(user.id)}
                              disabled={updatingAccountUserId === user.id}
                              className="p-1 text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Save"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleCancelAccountEdit}
                              disabled={updatingAccountUserId === user.id}
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500 flex-1">
                              {user.account ? user.account.name : '-'}
                            </span>
                            <button
                              onClick={() => handleEditAccount(user)}
                              className="p-1 text-brand hover:text-sky-600"
                              title="Edit Account"
                            >
                              <Pencil size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {editingUserId === user.id ? (
                          <>
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                              disabled={updatingUserId === user.id}
                            >
                              <option value="">Select Role</option>
                              <option value="Admin">Admin</option>
                              <option value="Staff">Staff</option>
                              <option value="Customer">Customer</option>
                            </select>
                            <button
                              onClick={() => handleSaveRole(user.id)}
                              disabled={updatingUserId === user.id}
                              className="p-1 text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Save"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updatingUserId === user.id}
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(getUserCategory(user))}`}>
                              {getCategoryLabel(getUserCategory(user))}
                            </span>
                            <button
                              onClick={() => handleEditRole(user)}
                              className="p-1 text-brand hover:text-sky-600"
                              title="Edit Role"
                            >
                              <Pencil size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Toggle button */}
                        <button
                          onClick={() => {
                            if (expandedActionsUserId === user.id) {
                              setExpandedActionsUserId(null);
                              setConfirmDeleteUserId(null);
                            } else {
                              setExpandedActionsUserId(user.id);
                              setConfirmDeleteUserId(null);
                            }
                          }}
                          className={`p-1 rounded transition-colors ${expandedActionsUserId === user.id ? 'text-gray-700 bg-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                          title="More actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Sliding action tray */}
                        <div
                          className={`flex items-center gap-1 overflow-hidden transition-all duration-200 ease-in-out ${expandedActionsUserId === user.id ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
                        >
                          {confirmDeleteUserId === user.id ? (
                            <>
                              <span className="text-xs text-gray-500 whitespace-nowrap">Confirm delete?</span>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUserId === user.id}
                                className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Confirm"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteUserId(null)}
                                disabled={deletingUserId === user.id}
                                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-50"
                                title="Cancel"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteUserId(user.id)}
                              className="p-1 text-red-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, activeUsers.length)}
                </span>{' '}
                of <span className="font-medium">{activeUsers.length}</span> users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsisBefore && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-brand text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(['customer', 'staff', 'admin', 'unassigned'] as RoleCategory[]).map((category) => (
            <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{getCategoryLabel(category)}</p>
                  <p className="text-2xl font-bold text-gray-900">{getCategoryCount(category)}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${getRoleBadgeColor(category)} flex items-center justify-center`}>
                  <span className="text-lg font-bold">{getCategoryCount(category)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
