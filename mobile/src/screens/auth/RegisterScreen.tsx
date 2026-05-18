import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { colors, radius, spacing, typography } from '../../constants/theme'

const fields = [
  { key: 'full_name',        label: 'Nom complet',         icon: '👤', keyboard: 'default'      as const },
  { key: 'email',            label: 'Email',                icon: '📧', keyboard: 'email-address' as const },
  { key: 'phone',            label: 'Téléphone',            icon: '📱', keyboard: 'phone-pad'    as const },
  { key: 'city',             label: 'Ville',                icon: '📍', keyboard: 'default'      as const },
  { key: 'delivery_address', label: 'Adresse de livraison', icon: '🏠', keyboard: 'default'      as const },
  { key: 'password',         label: 'Mot de passe',         icon: '🔒', keyboard: 'default'      as const, secure: true },
]

type FormState = Record<string, string>

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [form, setForm] = useState<FormState>({
    full_name: '', email: '', phone: '',
    city: '', delivery_address: '', password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister() {
    const empty = fields.find(f => !form[f.key])
    if (empty) { setError(`Remplissez le champ: ${empty.label}`); return }
    setError('')
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (signUpError) throw signUpError

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user!.id,
        full_name: form.full_name,
        username: form.email.split('@')[0],
        phone: form.phone,
        city: form.city,
        delivery_address: form.delivery_address,
      })
      if (profileError) throw profileError
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Ordmora</Text>
          <Text style={styles.subtitle}>Créer un compte</Text>
        </View>

        <View style={styles.form}>
          {fields.map(f => (
            <View key={f.key} style={styles.inputRow}>
              <Text style={styles.inputIcon}>{f.icon}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.label}
                placeholderTextColor={colors.textMuted}
                value={form[f.key]}
                onChangeText={v => set(f.key, v)}
                keyboardType={f.keyboard}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>S'inscrire</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
            <Text style={styles.linkText}>Déjà un compte ? </Text>
            <Text style={[styles.linkText, { color: colors.primaryLight }]}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, padding: spacing['2xl'], paddingTop: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 38, fontWeight: '900', color: colors.primaryLight },
  subtitle: { ...typography.small, marginTop: 6 },
  form: { gap: spacing.md },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center', backgroundColor: `${colors.danger}15`, padding: spacing.sm, borderRadius: radius.md },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.sm,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  linkText: { ...typography.small, fontSize: 13 },
})
