import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Gift } from '../types'
import { colors, radius, spacing, typography } from '../constants/theme'

export default function GiftsScreen() {
  const { profile, refreshProfile } = useAuth()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const fetchGifts = useCallback(async () => {
    const { data } = await supabase
      .from('gifts')
      .select('*')
      .eq('is_active', true)
      .order('points_required')
    setGifts(data ?? [])
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchGifts().finally(() => setLoading(false))
  }, [fetchGifts])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchGifts(), refreshProfile()])
    setRefreshing(false)
  }

  async function handleRedeem(gift: Gift) {
    if (!profile) return
    const missing = gift.points_required - profile.points_total
    if (missing > 0) {
      Alert.alert('Points insuffisants', `Il te manque ${missing} points pour débloquer ce cadeau.`)
      return
    }

    Alert.alert(
      'Confirmer l\'échange',
      `Échanger ${gift.points_required} points contre "${gift.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', style: 'default',
          onPress: async () => {
            setRedeeming(gift.id)
            try {
              const { data } = await supabase.rpc('redeem_gift', {
                p_client_id: profile.id,
                p_gift_id: gift.id,
              })
              if (data?.success) {
                Alert.alert('🎉 Cadeau échangé!', 'L\'admin vous contactera pour la livraison.')
                await Promise.all([fetchGifts(), refreshProfile()])
              } else {
                Alert.alert('Erreur', data?.error ?? 'Échec de l\'échange')
              }
            } finally {
              setRedeeming(null)
            }
          },
        },
      ]
    )
  }

  const userPoints = profile?.points_total ?? 0

  const renderGift = ({ item }: { item: Gift }) => {
    const canRedeem = item.stock > 0 && userPoints >= item.points_required
    const missing = item.points_required - userPoints
    const isRedeeming = redeeming === item.id

    return (
      <View style={[styles.card, canRedeem && styles.cardAvailable]}>
        <View style={styles.imageContainer}>
          {item.image_url
            ? <Image source={{ uri: item.image_url }} style={styles.image} />
            : <Text style={styles.imagePlaceholder}>🎁</Text>}
          {!canRedeem && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.giftName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsReq}>⭐ {item.points_required} pts</Text>
          </View>

          {!canRedeem && item.stock > 0 ? (
            <View style={styles.missingBox}>
              <Text style={styles.missingText}>Il te manque {missing} points</Text>
            </View>
          ) : item.stock === 0 ? (
            <View style={styles.outOfStockBox}>
              <Text style={styles.outOfStockText}>Épuisé</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={() => handleRedeem(item)}
              disabled={isRedeeming}
              activeOpacity={0.8}
            >
              {isRedeeming
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.redeemBtnText}>🎁 Échanger</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Cadeaux</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>⭐ {userPoints} pts</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={i => i.id}
          renderItem={renderGift}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyText}>Aucun cadeau disponible</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing['2xl'], paddingTop: 56, paddingBottom: spacing.lg },
  title: { ...typography.h1 },
  pointsBadge: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  pointsBadgeText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  row: { gap: spacing.md },
  card: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  cardAvailable: { borderColor: colors.primary },
  imageContainer: { aspectRatio: 1, backgroundColor: colors.bgCardHover, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { fontSize: 42 },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  lockIcon: { fontSize: 28 },
  cardBody: { padding: spacing.md, gap: spacing.sm },
  giftName: { ...typography.body, fontWeight: '600', lineHeight: 18 },
  pointsRow: { flexDirection: 'row', alignItems: 'center' },
  pointsReq: { color: colors.primaryLight, fontWeight: '700', fontSize: 12 },
  missingBox: { backgroundColor: `${colors.danger}15`, borderRadius: radius.md, padding: spacing.sm },
  missingText: { color: colors.danger, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  outOfStockBox: { backgroundColor: colors.bgCardHover, borderRadius: radius.md, padding: spacing.sm },
  outOfStockText: { color: colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  redeemBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.sm, alignItems: 'center' },
  redeemBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted },
})
