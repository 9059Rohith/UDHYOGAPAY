import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Service {
  id: string;
  name: string;
  icon: any;
  workersCount: number;
  avgRating: number;
  startingPrice: number;
}

interface Worker {
  id: string;
  name: string;
  profession: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  distance: string;
  verified: boolean;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'workers'>('services');

  const services: Service[] = [
    { id: '1', name: 'Plumbing', icon: 'water', workersCount: 234, avgRating: 4.5, startingPrice: 299 },
    { id: '2', name: 'Electrical', icon: 'flash', workersCount: 189, avgRating: 4.6, startingPrice: 349 },
    { id: '3', name: 'Carpentry', icon: 'hammer', workersCount: 156, avgRating: 4.4, startingPrice: 399 },
    { id: '4', name: 'Cleaning', icon: 'sparkles', workersCount: 312, avgRating: 4.7, startingPrice: 249 },
    { id: '5', name: 'Painting', icon: 'color-palette', workersCount: 145, avgRating: 4.5, startingPrice: 499 },
    { id: '6', name: 'AC Repair', icon: 'snow', workersCount: 98, avgRating: 4.8, startingPrice: 599 },
    { id: '7', name: 'Gardening', icon: 'leaf', workersCount: 67, avgRating: 4.3, startingPrice: 349 },
    { id: '8', name: 'Pest Control', icon: 'bug', workersCount: 54, avgRating: 4.6, startingPrice: 899 },
  ];

  const workers: Worker[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      profession: 'Plumber',
      rating: 4.9,
      completedJobs: 234,
      hourlyRate: 350,
      distance: '2.3 km',
      verified: true,
    },
    {
      id: '2',
      name: 'Amit Sharma',
      profession: 'Electrician',
      rating: 4.8,
      completedJobs: 189,
      hourlyRate: 400,
      distance: '1.8 km',
      verified: true,
    },
    {
      id: '3',
      name: 'Priya Singh',
      profession: 'House Cleaner',
      rating: 4.7,
      completedJobs: 312,
      hourlyRate: 280,
      distance: '3.5 km',
      verified: true,
    },
    {
      id: '4',
      name: 'Vikram Patel',
      profession: 'AC Technician',
      rating: 4.9,
      completedJobs: 156,
      hourlyRate: 500,
      distance: '4.2 km',
      verified: false,
    },
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.profession.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar with Voice */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services or workers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Ionicons name="mic" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.tabActive]}
          onPress={() => setActiveTab('services')}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={activeTab === 'services' ? '#2563eb' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
            Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workers' && styles.tabActive]}
          onPress={() => setActiveTab('workers')}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === 'workers' ? '#2563eb' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'workers' && styles.tabTextActive]}>
            Workers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'services' ? (
          <>
            {/* Popular Categories */}
            {!searchQuery && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Categories</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {['All', 'Home', 'Tech', 'Beauty', 'Auto'].map((category) => (
                    <TouchableOpacity key={category} style={styles.categoryChip}>
                      <Text style={styles.categoryChipText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Services Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'All Services'}
              </Text>
              <View style={styles.servicesGrid}>
                {filteredServices.map(service => (
                  <TouchableOpacity key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceIcon}>
                      <Ionicons name={service.icon as any} size={32} color="#2563eb" />
                    </View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceRating}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text style={styles.ratingText}>{service.avgRating}</Text>
                    </View>
                    <Text style={styles.workersCount}>{service.workersCount} workers</Text>
                    <Text style={styles.startingPrice}>From ₹{service.startingPrice}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Filters */}
            {!searchQuery && (
              <View style={styles.section}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filters}
                >
                  <TouchableOpacity style={styles.filterChip}>
                    <Ionicons name="location" size={16} color="#2563eb" />
                    <Text style={styles.filterChipText}>Near Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.filterChipText}>Top Rated</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <Ionicons name="cash" size={16} color="#10b981" />
                    <Text style={styles.filterChipText}>Best Value</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <Ionicons name="shield-checkmark" size={16} color="#8b5cf6" />
                    <Text style={styles.filterChipText}>Verified</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* Workers List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'Available Workers'}
              </Text>
              {filteredWorkers.map(worker => (
                <TouchableOpacity key={worker.id} style={styles.workerCard}>
                  <View style={styles.workerLeft}>
                    <View style={styles.workerAvatar}>
                      <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
                      {worker.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                      )}
                    </View>
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerName}>{worker.name}</Text>
                      <Text style={styles.workerProfession}>{worker.profession}</Text>
                      <View style={styles.workerMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="star" size={14} color="#fbbf24" />
                          <Text style={styles.metaText}>{worker.rating}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="briefcase" size={14} color="#666" />
                          <Text style={styles.metaText}>{worker.completedJobs} jobs</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="location" size={14} color="#666" />
                          <Text style={styles.metaText}>{worker.distance}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.workerRight}>
                    <Text style={styles.hourlyRate}>₹{worker.hourlyRate}/hr</Text>
                    <TouchableOpacity style={styles.bookButton}>
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
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
  searchWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f9fa',
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  horizontalList: {
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  workersCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  startingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  filters: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  workerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  workerProfession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workerMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  workerRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
