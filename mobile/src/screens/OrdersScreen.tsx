import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
  }, [profile])

  useEffect(() => {
    setLoading(true)
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  const renderOrder = ({ item }: { item: Order }) => {
    const cfg = statusConfig[item.status]
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNum}>{item.order_number}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${cfg.color}20` }]}>
            <Text>{cfg.icon}</Text>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

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
      <Text style={styles.title}>Mes Commandes</Text>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Aucune commande</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h1, paddingHorizontal: spacing['2xl'], paddingTop: 56, paddingBottom: spacing.lg },
  list: { paddingHorizontal: spacing['2xl'], paddingBottom: 100 },
  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  orderNum: { ...typography.body, fontWeight: '700' },
  orderDate: { ...typography.small, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { ...typography.small, color: colors.textMuted, fontSize: 13 },
  itemPrice: { ...typography.small, fontSize: 13, fontWeight: '600', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.small },
  totalAmount: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  pointsEarned: { marginTop: spacing.md, backgroundColor: `${colors.success}15`, borderRadius: radius.md, padding: spacing.sm },
  pointsEarnedText: { color: colors.success, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted },
})
