import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { colors, radius, spacing, typography } from '../constants/theme'

const fields = [
  { key: 'full_name',        label: 'Nom complet',         icon: '👤', keyboard: 'default'   as const },
  { key: 'phone',            label: 'Téléphone',            icon: '📱', keyboard: 'phone-pad' as const },
  { key: 'city',             label: 'Ville',                icon: '📍', keyboard: 'default'   as const },
  { key: 'delivery_address', label: 'Adresse de livraison', icon: '🏠', keyboard: 'default'   as const },
]

export default function ProfileScreen() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const insets = useSafeAreaInsets()

  const [form, setForm] = useState({
    full_name:        profile?.full_name        ?? '',
    phone:            profile?.phone            ?? '',
    city:             profile?.city             ?? '',
    delivery_address: profile?.delivery_address ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(form)
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      Alert.alert('✅ Sauvegardé', 'Votre profil a été mis à jour.')
    } catch (err: unknown) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Échec de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion', style: 'destructive',
          onPress: async () => {
            setSigningOut(true)
            await signOut()
          },
        },
      ]
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'O'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.full_name ?? 'Mon profil'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          {/* Points badge */}
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>⭐ {profile?.points_total ?? 0} points</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Informations personnelles</Text>

          {fields.map(f => (
            <View key={f.key} style={styles.inputRow}>
              <Text style={styles.inputIcon}>{f.icon}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key as keyof typeof form]}
                  onChangeText={v => set(f.key, v)}
                  keyboardType={f.keyboard}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.textMuted}
                  placeholder={f.label}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>}
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut
            ? <ActivityIndicator color={colors.danger} size="small" />
            : <Text style={styles.signOutText}>🚪 Se déconnecter</Text>}
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>Ordmora v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { paddingHorizontal: spacing['2xl'] },

  avatarSection: { alignItems: 'center', marginBottom: spacing['3xl'] },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '800' },
  name: { ...typography.h2, marginBottom: 4 },
  email: { ...typography.small, marginBottom: spacing.md },
  pointsBadge: {
    backgroundColor: colors.primary + '25',
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary + '60',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  pointsBadgeText: { color: colors.primaryLight, fontWeight: '700', fontSize: 13 },

  section: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  inputIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  inputWrap: { flex: 1 },
  inputLabel: { ...typography.small, fontSize: 11, marginBottom: 2 },
  input: { color: colors.text, fontSize: 15 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  signOutBtn: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.danger + '40',
    paddingVertical: spacing.lg, alignItems: 'center', marginBottom: spacing.lg,
  },
  signOutText: { color: colors.danger, fontWeight: '600', fontSize: 15 },

  version: { ...typography.small, textAlign: 'center', fontSize: 11 },
})
