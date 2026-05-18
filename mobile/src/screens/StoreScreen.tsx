import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Product, ProductCategory } from '../types'
import { colors, radius, spacing, typography } from '../constants/theme'

type Category = ProductCategory | 'tous'
const categories: { key: Category; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'parfums', label: 'Parfums' },
  { key: 'packs', label: 'Packs' },
  { key: 'accessoires', label: 'Accessoires' },
]

export default function StoreScreen() {
  const { profile } = useAuth()
  const insets = useSafeAreaInsets()
  const [products, setProducts] = useState<Product[]>([])
  const [cat, setCat] = useState<Category>('tous')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ordering, setOrdering] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (cat !== 'tous') query = query.eq('category', cat)
    const { data } = await query
    setProducts(data ?? [])
  }, [cat])

  useEffect(() => {
    setLoading(true)
    fetchProducts().finally(() => setLoading(false))
  }, [fetchProducts])

  async function placeOrder(product: Product) {
    if (!profile) return
    setOrdering(product.id)
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({ client_id: profile.id, total_amount: product.price, delivery_address: profile.delivery_address })
        .select()
        .single()

      if (error) throw error

      if (order) {
        await supabase.from('order_items').insert({
          order_id: order.id, product_id: product.id,
          quantity: 1, unit_price: product.price, points_earned: product.points_value,
        })
        Alert.alert(
          '✅ Commande passée !',
          `Votre commande de "${product.name}" a été enregistrée.\nVous gagnez ⭐ ${product.points_value} points à la livraison.`,
          [{ text: 'OK' }]
        )
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de passer la commande. Réessayez.')
    } finally {
      setOrdering(null)
    }
  }

  function handleOrder(product: Product) {
    if (!profile) return
    Alert.alert(
      'Confirmer la commande',
      `Commander "${product.name}" pour ${product.price} DH ?\n\nLivraison à : ${profile.delivery_address || 'Adresse non définie'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', style: 'default', onPress: () => placeOrder(product) },
      ]
    )
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProducts()
    setRefreshing(false)
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.image_url
          ? <Image source={{ uri: item.image_url }} style={styles.image} />
          : <Text style={styles.imagePlaceholder}>🧴</Text>}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>⭐ {item.points_value}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} DH</Text>
        <TouchableOpacity
          style={[styles.orderBtn, item.stock === 0 && styles.orderBtnDisabled]}
          onPress={() => handleOrder(item)}
          disabled={item.stock === 0 || ordering === item.id}
          activeOpacity={0.8}
        >
          {ordering === item.id
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.orderBtnText}>{item.stock === 0 ? 'Rupture' : 'Commander'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Nos Produits</Text>
          <Text style={styles.headerSub}>Achetez et gagnez des points</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) ?? 'O'}</Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
        {categories.map(c => (
          <TouchableOpacity
            key={c.key}
            style={[styles.catBtn, cat === c.key && styles.catBtnActive]}
            onPress={() => setCat(c.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.catLabel, cat === c.key && styles.catLabelActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={i => i.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyText}>Aucun produit disponible</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing['2xl'], paddingBottom: spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.primaryLight },
  headerSub: { ...typography.small, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  catScroll: { maxHeight: 44 },
  catContainer: { paddingHorizontal: spacing['2xl'], gap: spacing.sm },
  catBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  catLabelActive: { color: colors.white },
  list: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  row: { gap: spacing.md },
  card: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  imageContainer: { aspectRatio: 1, backgroundColor: colors.bgCardHover, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { fontSize: 40 },
  pointsBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  pointsBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  cardBody: { padding: spacing.md },
  productName: { ...typography.body, fontWeight: '600', lineHeight: 18 },
  productPrice: { color: colors.accent, fontWeight: '700', fontSize: 15, marginTop: 4 },
  orderBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.sm, alignItems: 'center' },
  orderBtnDisabled: { backgroundColor: colors.border },
  orderBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted },
})
