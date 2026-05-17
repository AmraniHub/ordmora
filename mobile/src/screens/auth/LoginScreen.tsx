import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { colors, radius, spacing, typography } from '../../constants/theme'

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!phone || !password) { setError('Remplissez tous les champs'); return }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${phone}@ordmora.app`,
        password,
      })
      if (error) throw error
    } catch {
      setError('Téléphone ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Ordmora</Text>
          <Text style={styles.subtitle}>Connexion à votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
            <Text style={styles.linkText}>Pas encore de compte ? </Text>
            <Text style={[styles.linkText, { color: colors.primaryLight }]}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: spacing['2xl'] },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: '900', color: colors.primaryLight },
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
