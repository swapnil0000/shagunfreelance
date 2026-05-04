import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  // Fetch all orders and derive customer data
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  // Derive unique customers from orders
  const customers = useMemo(() => {
    if (!data) return [];

    const customerMap = new Map();

    data.forEach((order) => {
      if (!order.user?._id) return;

      const userId = order.user._id;
      if (customerMap.has(userId)) {
        const existing = customerMap.get(userId);
        existing.totalOrders += 1;
        existing.totalSpent += order.total || 0;
      } else {
        customerMap.set(userId, {
          _id: userId,
          name: order.user.name || 'N/A',
          email: order.user.email || 'N/A',
          totalOrders: 1,
          totalSpent: order.total || 0,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [data]);

  // Client-side search filter
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const query = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">
          Customers
        </h1>
        <p className="text-sm text-neutral-500">
          {customers.length} total customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Email</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Total Orders</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-neutral-300" />
                    <p>No customers found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {customer.totalOrders}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
