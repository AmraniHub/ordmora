import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Order } from '../types'
import { colors, radius, spacing, typography } from '../constants/theme'

const statusConfig = {
  en_attente: { icon: '🕐', color: colors.warning,   label: 'Commande reçue' },
  en_cours:   { icon: '🚚', color: colors.accent,    label: 'Livraison en cours' },
  livree:     { icon: '✅', color: colors.success,   label: 'Marchandise livrée' },
  annulee:    { icon: '❌', color: colors.danger,    label: 'Annulée' },
}

export default function OrdersScreen() {
  const { profile } = useAuth()
  const insets = useSafeAreaInsets()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
  }, [profile])

  // Initial load
  useEffect(() => {
    setLoading(true)
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders])

  // Realtime subscription — live status updates without pull-to-refresh
  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel('mobile-orders-' + profile.id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'client_id=eq.' + profile.id,
        },
        (payload) => {
          setOrders(prev =>
            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  async function handleCancel(order: Order) {
    Alert.alert(
      'Annuler la commande',
      `Annuler ${order.order_number} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler', style: 'destructive',
          onPress: async () => {
            setCancelling(order.id)
            // Optimistic update
            setOrders(prev =>
              prev.map(o => o.id === order.id ? { ...o, status: 'annulee' as const } : o)
            )
            await supabase.from('orders').update({ status: 'annulee' }).eq('id', order.id)
            setCancelling(null)
          },
        },
      ]
    )
  }

  const renderOrder = ({ item }: { item: Order }) => {
    const cfg = statusConfig[item.status]
    const isCancelling = cancelling === item.id

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNum}>{item.order_number}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
              <Text>{cfg.icon}</Text>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>

            {/* Cancel — only when pending */}
            {item.status === 'en_attente' && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
                disabled={isCancelling}
                activeOpacity={0.8}
              >
                {isCancelling
                  ? <ActivityIndicator color={colors.danger} size="small" />
                  : <Text style={styles.cancelBtnText}>✕ Annuler</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        {item.order_items?.map(oi => (
          <View key={oi.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{oi.products?.name ?? 'Produit'}</Text>
            <Text style={styles.itemPrice}>{oi.unit_price} DH</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{item.total_amount} DH</Text>
        </View>

        {item.status === 'livree' && (
          <View style={styles.pointsEarned}>
            <Text style={styles.pointsEarnedText}>⭐ Points ajoutés à votre wallet</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { paddingTop: insets.top + 16 }]}>Mes Commandes</Text>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          renderItem={renderOrder}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Aucune commande</Text>
              <Text style={styles.emptySubText}>Commandez un produit dans la boutique</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h1, paddingHorizontal: spacing['2xl'], paddingBottom: spacing.lg },
  list: { paddingHorizontal: spacing['2xl'] },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end', gap: spacing.sm },
  orderNum: { ...typography.body, fontWeight: '700' },
  orderDate: { ...typography.small, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: colors.danger + '15',
    borderWidth: 1, borderColor: colors.danger + '40',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 80, alignItems: 'center',
  },
  cancelBtnText: { color: colors.danger, fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { ...typography.small, color: colors.textMuted, fontSize: 13 },
  itemPrice: { ...typography.small, fontSize: 13, fontWeight: '600', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.small },
  totalAmount: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  pointsEarned: {
    marginTop: spacing.md, backgroundColor: colors.success + '15',
    borderRadius: radius.md, padding: spacing.sm,
  },
  pointsEarnedText: { color: colors.success, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, fontWeight: '600', marginBottom: 4 },
  emptySubText: { ...typography.small, textAlign: 'center' },
})
