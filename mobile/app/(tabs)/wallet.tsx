import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletScreen() {
  const router = useRouter();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  const balance = 2580;
  const pendingAmount = 450;

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'debit',
      title: 'Plumbing Service',
      description: 'Payment to Rajesh Kumar',
      amount: 500,
      timestamp: '2h ago',
      status: 'completed',
    },
    {
      id: '2',
      type: 'credit',
      title: 'Cashback Received',
      description: 'Order #1234 cashback',
      amount: 80,
      timestamp: '1d ago',
      status: 'completed',
    },
    {
      id: '3',
      type: 'debit',
      title: 'AC Repair',
      description: 'Payment to Vikram Patel',
      amount: 1200,
      timestamp: '3d ago',
      status: 'completed',
    },
    {
      id: '4',
      type: 'credit',
      title: 'Refund',
      description: 'Cancelled booking refund',
      amount: 600,
      timestamp: '5d ago',
      status: 'completed',
    },
    {
      id: '5',
      type: 'debit',
      title: 'House Cleaning',
      description: 'Payment to Priya Singh',
      amount: 450,
      timestamp: '7d ago',
      status: 'pending',
    },
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={32} color="#fff" />
            </View>
          </View>

          <View style={styles.pendingInfo}>
            <Ionicons name="time-outline" size={16} color="#f59e0b" />
            <Text style={styles.pendingText}>₹{pendingAmount} pending</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowAddMoney(true)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="add-circle" size={24} color="#2563eb" />
              </View>
              <Text style={styles.actionText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="arrow-up-circle" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="swap-horizontal" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="card" size={24} color="#ef4444" />
              </View>
              <Text style={styles.actionText}>Cards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Money Section */}
        {showAddMoney && (
          <View style={styles.addMoneySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add Money</Text>
              <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />

            <View style={styles.quickAmounts}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmountChip}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text style={styles.quickAmountText}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add to Wallet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'credit' 
                  ? styles.transactionIconCredit 
                  : styles.transactionIconDebit
              ]}>
                <Ionicons
                  name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={transaction.type === 'credit' ? '#10b981' : '#ef4444'}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionFooter}>
                  <Text style={styles.transactionTime}>{transaction.timestamp}</Text>
                  {transaction.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[
                styles.transactionAmount,
                transaction.type === 'credit' 
                  ? styles.transactionAmountCredit 
                  : styles.transactionAmountDebit
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Offers</Text>
          
          <View style={styles.offerCard}>
            <View style={styles.offerIcon}>
              <Ionicons name="gift" size={24} color="#f59e0b" />
            </View>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Add ₹1000, Get ₹50 Cashback</Text>
              <Text style={styles.offerDescription}>
                Valid till 31st March 2026
              </Text>
            </View>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.offerCard}>
            <View style={styles.offerIcon}>
              <Ionicons name="card" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Link UPI & Get ₹25 Bonus</Text>
              <Text style={styles.offerDescription}>
                One-time offer for new users
              </Text>
            </View>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#2563eb',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  addMoneySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingVertical: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAmountChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconCredit: {
    backgroundColor: '#d1fae5',
  },
  transactionIconDebit: {
    backgroundColor: '#fee2e2',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  transactionAmountCredit: {
    color: '#10b981',
  },
  transactionAmountDebit: {
    color: '#ef4444',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
    color: '#666',
  },
  offerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  offerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
