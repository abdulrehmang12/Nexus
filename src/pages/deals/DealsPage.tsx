import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, CreditCard, Wallet } from 'lucide-react';
import api from '../../lib/api';
import { Transaction, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

type Provider = 'stripe' | 'paypal';
type Status = 'pending' | 'completed' | 'failed';

export const DealsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipients, setRecipients] = useState<User[]>([]);
  const [provider, setProvider] = useState<Provider>('stripe');
  const [requestedStatus, setRequestedStatus] = useState<Status>('completed');
  const [amounts, setAmounts] = useState({ deposit: '', withdraw: '', transfer: '' });
  const [recipientId, setRecipientId] = useState('');
  const [note, setNote] = useState('');

  const loadData = async () => {
    const [{ data: history }, { data: users }] = await Promise.all([
      api.get<Transaction[]>('/payments/history'),
      api.get<User[]>('/users'),
    ]);
    setTransactions(history);
    setRecipients(users);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitPayment = async (path: 'deposit' | 'withdraw' | 'transfer') => {
    const basePayload = {
      provider,
      requestedStatus,
      paymentMethod: 'sandbox',
      note,
    };
    const payload =
      path === 'transfer'
        ? { ...basePayload, amount: Number(amounts.transfer), recipientId }
        : { ...basePayload, amount: Number(amounts[path]) };

    await api.post(`/payments/${path}`, payload);
    setAmounts({ deposit: '', withdraw: '', transfer: '' });
    setRecipientId('');
    setNote('');
    await loadData();
  };

  const totalVolume = useMemo(() => transactions.reduce((sum, transaction) => sum + transaction.amount, 0), [transactions]);
  const pendingCount = useMemo(() => transactions.filter((transaction) => transaction.status === 'pending').length, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Sandbox</h1>
        <p className="text-gray-600">Run Stripe or PayPal sandbox-style payment records with pending, completed, and failed outcomes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Gateway Setup</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['stripe', 'paypal'] as Provider[]).map((entry) => (
                <Button key={entry} variant={provider === entry ? 'primary' : 'outline'} onClick={() => setProvider(entry)}>
                  {entry === 'stripe' ? 'Stripe' : 'PayPal'}
                </Button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sandbox result</label>
              <select value={requestedStatus} onChange={(e) => setRequestedStatus(e.target.value as Status)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <CreditCard size={18} />
                <span className="font-medium">{provider === 'stripe' ? 'Stripe Sandbox' : 'PayPal Sandbox'}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Pending count: {pendingCount}</p>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:col-span-3 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Deposit</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Amount" type="number" value={amounts.deposit} onChange={(e) => setAmounts({ ...amounts, deposit: e.target.value })} fullWidth />
              <Button leftIcon={<ArrowDownCircle size={18} />} fullWidth onClick={() => submitPayment('deposit')}>
                Create Deposit
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Withdraw</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Amount" type="number" value={amounts.withdraw} onChange={(e) => setAmounts({ ...amounts, withdraw: e.target.value })} fullWidth />
              <Button leftIcon={<ArrowUpCircle size={18} />} fullWidth onClick={() => submitPayment('withdraw')}>
                Create Withdrawal
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Transfer</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Amount" type="number" value={amounts.transfer} onChange={(e) => setAmounts({ ...amounts, transfer: e.target.value })} fullWidth />
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a user</option>
                  {recipients.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <Button leftIcon={<ArrowLeftRight size={18} />} fullWidth onClick={() => submitPayment('transfer')}>
                Create Transfer
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Wallet size={18} />
            <span className="text-sm font-medium">Total volume: ${totalVolume.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium capitalize text-gray-900">{transaction.type}</h3>
                    <Badge variant={transaction.status === 'completed' ? 'success' : transaction.status === 'failed' ? 'error' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                    <Badge variant="gray">{transaction.provider}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Ref {transaction.reference} • Session {transaction.providerSessionId}
                    {transaction.counterpartyUserId ? ` • Recipient: ${transaction.counterpartyUserId.name}` : ''}
                  </p>
                  {transaction.note && <p className="mt-1 text-sm text-gray-600">{transaction.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-sm text-gray-500">No transactions recorded yet.</p>}
        </CardBody>
      </Card>
    </div>
  );
};
