import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Booking {
  id: string;
  workerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  rating?: number;
}

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      workerName: 'Rajesh Kumar',
      service: 'Plumbing',
      date: '2026-03-05',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 500,
    },
    {
      id: '2',
      workerName: 'Amit Sharma',
      service: 'Electrical Work',
      date: '2026-03-02',
      time: '2:00 PM',
      status: 'completed',
      amount: 800,
      rating: 5,
    },
    {
      id: '3',
      workerName: 'Priya Singh',
      service: 'House Cleaning',
      date: '2026-03-08',
      time: '9:00 AM',
      status: 'pending',
      amount: 600,
    },
    {
      id: '4',
      workerName: 'Vikram Patel',
      service: 'AC Repair',
      date: '2026-02-28',
      time: '11:00 AM',
      status: 'completed',
      amount: 1200,
      rating: 4,
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e', icon: 'time-outline' };
      case 'confirmed':
        return { bg: '#dbeafe', text: '#1e40af', icon: 'checkmark-circle-outline' };
      case 'in-progress':
        return { bg: '#e0e7ff', text: '#4338ca', icon: 'timer-outline' };
      case 'completed':
        return { bg: '#d1fae5', text: '#065f46', icon: 'checkmark-done-outline' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#991b1b', icon: 'close-circle-outline' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', icon: 'help-outline' };
    }
  };

  const filteredBookings = bookings
    .filter(booking => {
      if (filter === 'all') return true;
      if (filter === 'pending') return booking.status === 'pending' || booking.status === 'confirmed';
      if (filter === 'completed') return booking.status === 'completed';
      return true;
    })
    .filter(booking =>
      booking.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabs}
      >
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
            Upcoming ({bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No bookings found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Start booking services now!'}
            </Text>
          </View>
        ) : (
          filteredBookings.map(booking => {
            const statusStyle = getStatusColor(booking.status);
            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => {
                  // Navigate to booking details
                }}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.workerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {booking.workerName.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.workerName}>{booking.workerName}</Text>
                      <Text style={styles.service}>{booking.service}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>₹{booking.amount}</Text>
                  </View>
                </View>

                {booking.status === 'completed' && booking.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Your Rating:</Text>
                    <View style={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < booking.rating! ? 'star' : 'star-outline'}
                          size={16}
                          color="#fbbf24"
                        />
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.bookingActions}>
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={18} color="#2563eb" />
                        <Text style={styles.actionButtonText}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
                        <Ionicons name="call-outline" size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                          Call
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : booking.status === 'completed' && !booking.rating ? (
                    <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
                      <Ionicons name="star-outline" size={18} color="#fff" />
                      <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                        Rate Service
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterTabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workerInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  service: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  actionButtonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
