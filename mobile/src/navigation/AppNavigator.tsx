import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors } from '../constants/theme'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import StoreScreen from '../screens/StoreScreen'
import OrdersScreen from '../screens/OrdersScreen'
import WalletScreen from '../screens/WalletScreen'
import GiftsScreen from '../screens/GiftsScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const tabIcons: Record<string, string> = {
  Store: '🛍️',
  Orders: '📋',
  Wallet: '⭐',
  Gifts: '🎁',
  Profile: '👤',
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{tabIcons[name]}</Text>
    </View>
  )
}

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,10,0.97)',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Store"   component={StoreScreen}   options={{ title: 'Boutique' }} />
      <Tab.Screen name="Orders"  component={OrdersScreen}  options={{ title: 'Commandes' }} />
      <Tab.Screen name="Wallet"  component={WalletScreen}  options={{ title: 'Points' }} />
      <Tab.Screen name="Gifts"   component={GiftsScreen}   options={{ title: 'Cadeaux' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: '900', color: colors.primaryLight }}>Ordmora</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      {session ? <ClientTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}
