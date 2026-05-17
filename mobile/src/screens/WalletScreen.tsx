import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { WalletTransaction } from '../types'
import { colors, radius, spacing, typography } from '../constants/theme'

const typeConfig = {
  earned:   { icon: '📈', color: colors.success, label: 'Gagné',   sign: '+' },
  spent:    { icon: '🎁', color: colors.danger,  label: 'Dépensé', sign: '-' },
  adjusted: { icon: '⚙️', color: colors.warning, label: 'Ajusté',  sign: '' },
  expired:  { icon: '⏰', color: colors.textMuted, label: 'Expiré', sign: '-' },
}

export default function WalletScreen() {
  const { profile, refreshProfile } = useAuth()
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setTransactions(data ?? [])
  }, [profile])

  useEffect(() => {
    setLoading(true)
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchData(), refreshProfile()])
    setRefreshing(false)
  }

  const soonExpiring = transactions
    .filter(t => t.type === 'earned' && t.expires_at)
    .filter(t => {
      const days = (new Date(t.expires_at!).getTime() - Date.now()) / 86400000
      return days > 0 && days < 30
    })
    .reduce((sum, t) => sum + t.points, 0)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Mon Wallet</Text>

      {/* Points card */}
      <View style={styles.pointsCard}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <Text style={styles.pointsLabel}>Mes points</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsValue}>{profile?.points_total ?? 0}</Text>
          <View style={styles.ptsBadge}>
            <Text style={styles.ptsBadgeText}>⭐ pts</Text>
          </View>
        </View>
        <Text style={styles.pointsName}>{profile?.full_name}</Text>

        {soonExpiring > 0 && (
          <View style={styles.expiryWarning}>
            <Text style={styles.expiryText}>⚠️ {soonExpiring} points expirent bientôt</Text>
          </View>
        )}
      </View>

      {/* History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historique</Text>
        <Text style={styles.historyCount}>{transactions.length} opérations</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Aucune transaction</Text>
          <Text style={styles.emptySubText}>Commandez un produit pour gagner des points</Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {transactions.map(tx => {
            const cfg = typeConfig[tx.type]
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: `${cfg.color}20` }]}>
                  <Text>{cfg.icon}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={[styles.txPoints, { color: cfg.color }]}>
                  {cfg.sign}{Math.abs(tx.points)} pts
                </Text>
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing['2xl'], paddingTop: 56 },
  title: { ...typography.h1, marginBottom: spacing['2xl'] },
  pointsCard: {
    borderRadius: radius.xl + 4, padding: spacing['2xl'], marginBottom: spacing['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  decorCircle1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.15)' },
  decorCircle2: { position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)' },
  pointsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  pointsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  pointsValue: { fontSize: 64, fontWeight: '900', color: colors.white, lineHeight: 72 },
  ptsBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  ptsBadgeText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  pointsName: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 },
  expiryWarning: { marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, padding: spacing.sm },
  expiryText: { color: colors.white, fontSize: 12, fontWeight: '500' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  historyTitle: { ...typography.h3 },
  historyCount: { ...typography.small },
  txList: { gap: spacing.sm },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { ...typography.body, fontWeight: '500' },
  txDate: { ...typography.small, marginTop: 2 },
  txPoints: { fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, fontWeight: '600', marginBottom: 4 },
  emptySubText: { ...typography.small, textAlign: 'center' },
})
