import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, AppState, BackHandler } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorBoundary from "./ErrorBoundary";
import { HomeSkeleton } from "./AppSkeleton";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProgressScreen from "./screens/ProgressScreen";
import MeasurementsScreen from "./screens/MeasurementsScreen";
import CommunityScreen from "./screens/CommunityScreen";
import CommunityIntroScreen from "./screens/CommunityIntroScreen";
import UmbralScreen from "./screens/UmbralScreen";
import UmbralDaysScreen from "./screens/UmbralDaysScreen";
import UmbralDayScreen from "./screens/UmbralDayScreen";
import DespertarScreen from "./screens/DespertarScreen";
import DespertarDaysScreen from "./screens/DespertarDaysScreen";
import DespertarDayScreen from "./screens/DespertarDayScreen";
import IdentityScreen from "./screens/IdentityScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import RenewalScreen from "./screens/RenewalScreen";
import MeditacionesScreen from "./screens/MeditacionesScreen";
import RecetasScreen from "./screens/RecetasScreen";
import AyunoScreen from "./screens/AyunoScreen";
import ChatScreen from "./screens/ChatScreen";
import BibliotecaScreen from "./screens/BibliotecaScreen";
import EntrenamientosScreen from "./screens/EntrenamientosScreen";
import ProgramSelectionScreen from "./screens/ProgramSelectionScreen";
import SuenoScreen from "./screens/SuenoScreen";
import StatsScreen from "./screens/StatsScreen";
import ResumenSemanalScreen from "./screens/ResumenSemanalScreen";
import RachaRotaScreen from "./screens/RachaRotaScreen";
import HidratacionScreen from "./screens/HidratacionScreen";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { getXP, sumarXP, getNivel, getProgreso } from "./xp";
import { cacheClear } from "./cache";
import { registerForPushNotifications, scheduleDailyHabits, scheduleProximoDia, scheduleRecordatorioDia, notificarInicioProgramma } from "./notifications";

const TABS = [
  { key: "inicio",    icon: "🏠", label: "Inicio"    },
  { key: "reto",      icon: "🔥", label: "Reto"      },
  { key: "practicas", icon: "✨", label: "Prácticas"  },
  { key: "biblioteca",icon: "📚", label: "Biblioteca" },
  { key: "perfil",    icon: "👤", label: "Perfil"    },
];

function TabBar({ activeTab, onSelect, badgeReto = false }) {
  return (
    <View style={tabStyles.container}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => { Haptics.selectionAsync(); onSelect(tab.key); }}
            style={tabStyles.tab}
            activeOpacity={0.7}
          >
            <View style={{ position: "relative" }}>
              <Text style={[tabStyles.icon, active && tabStyles.iconActive]}>{tab.icon}</Text>
              {tab.key === "reto" && badgeReto && (
                <View style={tabStyles.badge} />
              )}
            </View>
            <Text style={[tabStyles.label, active && tabStyles.labelActive]}>{tab.label}</Text>
            {active && <View style={tabStyles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row", backgroundColor: "#13120f",
    borderTopWidth: 1, borderTopColor: "rgba(201,168,76,0.15)",
    paddingBottom: 24, paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, position: "relative", paddingVertical: 4 },
  icon: { fontSize: 22, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 10, color: "#4a3a20", fontWeight: "700" },
  labelActive: { color: "#c9a84c" },
  dot:   { position: "absolute", bottom: -2, width: 4, height: 4, borderRadius: 2, backgroundColor: "#c9a84c" },
  badge: { position: "absolute", top: -2, right: -4, width: 9, height: 9, borderRadius: 5, backgroundColor: "#f87171", borderWidth: 1.5, borderColor: "#13120f" },
});

export default function App() {
  const [member, setMember]                       = useState(null);
  const [onboardingDone, setOnboardingDone]       = useState(false);
  const [activeTab, setActiveTab]                 = useState("inicio");
  const [subScreen, setSubScreen]                 = useState(null);
  const [selectedProgram, setSelectedProgram]     = useState(null);
  const [programChecked, setProgramChecked]       = useState(false);
  const [umbralStartedAt, setUmbralStartedAt]     = useState(null);
  const [umbralCompletedDays, setUmbralCompletedDays]       = useState([]);
  const [selectedUmbralDay, setSelectedUmbralDay] = useState(1);
  const [despertarStartedAt, setDespertarStartedAt]         = useState(null);
  const [despertarCompletedDays, setDespertarCompletedDays] = useState([]);
  const [selectedDespertarDay, setSelectedDespertarDay]     = useState(1);
  const [habitStreak, setHabitStreak]             = useState(0);
  const [badgeReto, setBadgeReto]                 = useState(false);
  const [xpTotal, setXpTotal]                     = useState(0);
  const [resumenSemana, setResumenSemana]         = useState(null); // null | 1|2|3|4
  const [bannerDiaPendiente, setBannerDiaPendiente] = useState(false);
  const [rachaRota, setRachaRota]                   = useState(null); // null | número de racha anterior

  const [appReady,  setAppReady]   = useState(false);
  const [bloqueado, setBloqueado]               = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const ultimoBackground = useRef(null);

  const memberKey = member?.phone || member?.id || "guest";
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try { registerForPushNotifications(); } catch(e) {}
    try { scheduleDailyHabits(); } catch(e) {}
    checkOnboarding();

    // Escuchar cuando la app vuelve al primer plano
    const sub = AppState.addEventListener('change', async (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'background' || nextState === 'inactive') {
        ultimoBackground.current = Date.now();
      }

      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        // Solo bloquear si estuvo más de 10 segundos en background y hay sesión
        const tiempoFuera = Date.now() - (ultimoBackground.current || 0);
        if (tiempoFuera < 30000) return;

        try {
          const bioEnabled = await AsyncStorage.getItem('bio_enabled');
          // Activado por defecto — solo se desactiva si el usuario lo apaga en Perfil
          if (bioEnabled === 'false') return;
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled   = await LocalAuthentication.isEnrolledAsync();
          if (!compatible || !enrolled) return;

          // Disparar autenticación directa sin pantalla intermedia
          setBloqueado(true);
          setTimeout(async () => {
            try {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verificá tu identidad para continuar',
                cancelLabel: 'Cancelar',
                fallbackLabel: 'Usar PIN',
                disableDeviceFallback: false,
              });
              if (result.success) setBloqueado(false);
            } catch(e) {}
          }, 300);
        } catch(e) {}
      }
    });

    return () => { sub.remove(); };
  }, []);

  // BackHandler separado para capturar subScreen actualizado
  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (bloqueado) return true;
      if (subScreen) { goBack(); return true; }
      return false;
    });
    return () => backSub.remove();
  }, [subScreen, bloqueado]);

  async function desbloquear() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verificá tu identidad para continuar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar PIN',
        disableDeviceFallback: false,
      });
      if (result.success) setBloqueado(false);
    } catch(e) {}
  }

  // ── Migración de schema AsyncStorage ──────────────────────
  async function runMigrations() {
    try {
      const SCHEMA_VERSION = '2';
      const current = await AsyncStorage.getItem('schema_version');
      if (current === SCHEMA_VERSION) return;

      // v1 → v2: nada que migrar aún, base para el futuro
      if (!current) {
        // Primera instalación o usuario viejo sin versión — ok
      }
      await AsyncStorage.setItem('schema_version', SCHEMA_VERSION);
    } catch(e) { console.warn('Migration error:', e); }
  }

  async function checkOnboarding() {
    try {
      await runMigrations();
      const done = await AsyncStorage.getItem("onboarding_done");
      if (done === "true") setOnboardingDone(true);
    } catch(e) {}
    finally { setAppReady(true); }
  }

  useEffect(() => {
    if (!member) return;
    loadAllData();
  }, [member]);

  async function loadAllData() {
    try {
      const [uc, us, dc, ds, sp, sat] = await Promise.all([
        AsyncStorage.getItem(`umbral_completed_${memberKey}`),
        AsyncStorage.getItem(`umbral_started_at_${memberKey}`),
        AsyncStorage.getItem(`despertar_completed_${memberKey}`),
        AsyncStorage.getItem(`despertar_started_at_${memberKey}`),
        AsyncStorage.getItem(`selected_program_${memberKey}`),
        AsyncStorage.getItem(`program_selected_at_${memberKey}`),
      ]);
      setUmbralCompletedDays(uc ? JSON.parse(uc) : []);
      setUmbralStartedAt(us || null);
      setDespertarCompletedDays(dc ? JSON.parse(dc) : []);
      setDespertarStartedAt(ds || null);
      if (sp && sat) {
        const diasDesde = (Date.now() - new Date(sat)) / 86400000;
        setSelectedProgram(diasDesde < 30 ? sp : null);
      } else {
        setSelectedProgram(null);
      }
      setProgramChecked(true);
      await loadHabitStreak();
      const ucParsed = uc ? JSON.parse(uc) : [];
      const dcParsed = dc ? JSON.parse(dc) : [];
      calcularBadgeReto(ucParsed, dcParsed, sp);
      const xp = await getXP(memberKey);
      setXpTotal(xp);
      await verificarResumenSemanal(sp, us, ds, ucParsed, dcParsed);
      verificarBannerDiaPendiente(sp, us, ds, ucParsed, dcParsed);
      await verificarRachaRota();
    } catch(e) {
      setProgramChecked(true);
    }
  }

  async function verificarRachaRota() {
    try {
      const raw = await AsyncStorage.getItem(`progress_${memberKey}`);
      const history = raw ? JSON.parse(raw) : {};

      // Calcular racha de ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const ayerKey = `${ayer.getFullYear()}-${String(ayer.getMonth()+1).padStart(2,'0')}-${String(ayer.getDate()).padStart(2,'0')}`;

      // Si ayer no hay registro → racha rota
      const hayerPercent = history[ayerKey]?.percent || 0;
      if (hayerPercent > 0) return; // ayer completó algo, racha ok

      // Calcular cuánta racha había antes de ayer
      let rachaAnterior = 0;
      for (let i = 2; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if ((history[k]?.percent || 0) > 0) rachaAnterior++;
        else break;
      }
      if (rachaAnterior < 2) return; // no había racha significativa

      // Verificar que no hayamos mostrado esto hoy
      const hoy = new Date();
      const hoyKey2 = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
      const visto = await AsyncStorage.getItem(`racha_rota_vista_${memberKey}_${hoyKey2}`);
      if (visto) return;

      await AsyncStorage.setItem(`racha_rota_vista_${memberKey}_${hoyKey2}`, '1');
      setRachaRota(rachaAnterior);
    } catch(e) {}
  }

  async function verificarResumenSemanal(programa, umbralStarted, despertarStarted, umbralDays, despertarDays) {
    try {
      if (!programa) return;
      const startedAt   = programa === 'despertar' ? despertarStarted : umbralStarted;
      const completados = programa === 'despertar' ? despertarDays    : umbralDays;
      if (!startedAt) return;

      const diasTranscurridos = Math.floor((Date.now() - new Date(startedAt)) / 86400000);
      // Semanas cumplidas: día 7, 14, 21, 28+
      const semanaActual = Math.min(4, Math.floor(diasTranscurridos / 7));
      if (semanaActual < 1) return;

      for (let s = semanaActual; s >= 1; s--) {
        const visto = await AsyncStorage.getItem(`resumen_semana_${s}_${memberKey}`);
        if (!visto) {
          // Verificar que haya al menos 1 día completado en esa semana
          const diaInicio = (s - 1) * 7 + 1;
          const diaFin    = s * 7;
          const tieneCompletados = completados.some(d => d >= diaInicio && d <= diaFin);
          if (tieneCompletados) {
            setResumenSemana(s);
            return;
          }
        }
      }
    } catch(e) {}
  }

  function verificarBannerDiaPendiente(programa, umbralStarted, despertarStarted, umbralDays, despertarDays) {
    try {
      if (!programa) { setBannerDiaPendiente(false); return; }
      const startedAt   = programa === 'despertar' ? despertarStarted : umbralStarted;
      const completados = programa === 'despertar' ? despertarDays    : umbralDays;
      if (!startedAt) { setBannerDiaPendiente(false); return; }
      const diaActual = Math.max(1, Math.min(30, Math.floor((Date.now() - new Date(startedAt)) / 86400000) + 1));
      setBannerDiaPendiente(!completados.includes(diaActual));
    } catch(e) { setBannerDiaPendiente(false); }
  }

  function calcularBadgeReto(umbralDays, despertarDays, programa) {
    try {
      const completados = programa === "despertar" ? despertarDays : umbralDays;
      const started = programa === "despertar"
        ? AsyncStorage.getItem(`despertar_started_at_${memberKey}`)
        : AsyncStorage.getItem(`umbral_started_at_${memberKey}`);
      // Calculamos en base a fecha actual si hay started
      // Si el día actual no está completado → badge activo
      const startKey = programa === "despertar"
        ? `despertar_started_at_${memberKey}`
        : `umbral_started_at_${memberKey}`;
      AsyncStorage.getItem(startKey).then(startedAt => {
        if (!startedAt) { setBadgeReto(false); return; }
        const diaActual = Math.max(1, Math.min(30, Math.floor((Date.now() - new Date(startedAt)) / 86400000) + 1));
        const hayDiaDisponible = !completados.includes(diaActual);
        setBadgeReto(hayDiaDisponible);
      });
    } catch(e) { setBadgeReto(false); }
  }

  async function loadHabitStreak() {
    try {
      const raw = await AsyncStorage.getItem(`progress_${memberKey}`);
      const history = raw ? JSON.parse(raw) : {};
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        if ((history?.[key]?.percent || 0) > 0) streak++;
        else break;
      }
      setHabitStreak(streak);
    } catch(e) { setHabitStreak(0); }
  }

  async function saveUmbralDay(day) {
    const updated = Array.from(new Set([...umbralCompletedDays, day])).sort((a,b) => a-b);
    setUmbralCompletedDays(updated);
    await AsyncStorage.setItem(`umbral_completed_${memberKey}`, JSON.stringify(updated));
    await scheduleProximoDia('umbral', day);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBadgeReto(false);
    setBannerDiaPendiente(false);
    // ── XP ──
    let xp = await sumarXP(memberKey, 'dia_programa', `Umbral día ${day}`);
    if (updated.length > 0 && updated.length % 7 === 0) {
      xp = await sumarXP(memberKey, 'racha_7', `Racha de ${updated.length} días Umbral`);
    }
    setXpTotal(xp);
  }

  async function saveUmbralStartedAt(iso) {
    setUmbralStartedAt(iso);
    await AsyncStorage.setItem(`umbral_started_at_${memberKey}`, iso);
  }

  async function saveDespertarDay(day) {
    const updated = Array.from(new Set([...despertarCompletedDays, day])).sort((a,b) => a-b);
    setDespertarCompletedDays(updated);
    await AsyncStorage.setItem(`despertar_completed_${memberKey}`, JSON.stringify(updated));
    await scheduleProximoDia('despertar', day);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBadgeReto(false);
    setBannerDiaPendiente(false);
    // ── XP ──
    let xp = await sumarXP(memberKey, 'dia_programa', `Despertar día ${day}`);
    if (updated.length > 0 && updated.length % 7 === 0) {
      xp = await sumarXP(memberKey, 'racha_7', `Racha de ${updated.length} días Despertar`);
    }
    setXpTotal(xp);
  }

  async function saveDespertarStartedAt(iso) {
    if (despertarStartedAt) return;
    setDespertarStartedAt(iso);
    await AsyncStorage.setItem(`despertar_started_at_${memberKey}`, iso);
  }

  function handleLogout() {
    cacheClear();
    setMember(null);
    setOnboardingDone(false);
    setActiveTab("inicio");
    setSubScreen(null);
    setSelectedProgram(null);
    setProgramChecked(false);
    setUmbralStartedAt(null);
    setUmbralCompletedDays([]);
    setDespertarStartedAt(null);
    setDespertarCompletedDays([]);
    setHabitStreak(0);
    setResumenSemana(null);
    setBannerDiaPendiente(false);
    setXpTotal(0);
    setRachaRota(null);
  }

  function navigate(screen) { setSubScreen(screen); }
  function goBack() { setSubScreen(null); loadHabitStreak(); setRefreshKey(k => k + 1); }

  const umbralDay = umbralStartedAt
    ? Math.max(1, Math.min(30, Math.floor((Date.now() - new Date(umbralStartedAt)) / 86400000) + 1))
    : 1;

  const umbralActivo    = selectedProgram === "umbral";
  const despertarActivo = selectedProgram === "despertar";

  // ─── ONBOARDING ───────────────────────────────────────────
  // ── APP LOADING ──────────────────────────────────────
  if (!appReady) {
    return (
      <>
        <StatusBar style="light" />
        <HomeSkeleton />
      </>
    );
  }

  // ── PANTALLA DE BLOQUEO ──────────────────────────────
  if (bloqueado && member) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <StatusBar style="light" />
        <Text style={{ fontSize: 56, marginBottom: 24 }}>🔒</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#f0e6c8', marginBottom: 8 }}>App bloqueada</Text>
        <Text style={{ fontSize: 14, color: '#6a5a40', textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
          Verificá tu identidad para continuar usando Ketoclub
        </Text>
        <TouchableOpacity
          onPress={desbloquear}
          activeOpacity={0.85}
          style={{ backgroundColor: '#c9a84c', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 48 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#0a0a0c' }}>🔑 Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!onboardingDone) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen
          member={member}
          onFinish={async (datos) => {
            await AsyncStorage.setItem("onboarding_done", "true");
            setOnboardingDone(true);
          }}
        />
      </>
    );
  }

  // ─── LOGIN ────────────────────────────────────────────────
  if (!member) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLogin={setMember} />
      </>
    );
  }

  // ─── SELECCIÓN PROGRAMA ───────────────────────────────────
  if (programChecked && !selectedProgram) {
    return (
      <>
        <StatusBar style="light" />
        <ProgramSelectionScreen
          member={member}
          onSelect={async (programa, iso) => {
            setSelectedProgram(programa);
            if (programa === "umbral") await saveUmbralStartedAt(iso);
            else await saveDespertarStartedAt(iso);
            await notificarInicioProgramma(programa);
            await scheduleRecordatorioDia(programa, 1);
            setActiveTab("reto");
          }}
        />
      </>
    );
  }

  // ─── SUB-SCREENS ──────────────────────────────────────────
  if (subScreen) {
    const renderSub = () => {
      switch (subScreen) {
        case "progress":
          return <ProgressScreen member={member} onBack={goBack} onLogout={handleLogout} />;
        case "measurements":
          return <MeasurementsScreen member={member} onBack={goBack} />;
        case "community":
          return <CommunityScreen onBack={goBack} onOpenCommunityIntro={() => navigate("community_intro")} />;
        case "community_intro":
          return <CommunityIntroScreen onBack={goBack} />;
        case "identity":
          return (
            <IdentityScreen
              member={member}
              umbralStartedAt={umbralStartedAt}
              umbralCompletedDays={umbralCompletedDays}
              habitStreak={habitStreak}
              onBack={goBack}
              onOpenUmbral={() => navigate("umbral")}
              onOpenProgress={() => navigate("progress")}
            />
          );
        case "umbral":
          return (
            <UmbralScreen
              member={member}
              startedAtISO={umbralStartedAt}
              completedDays={umbralCompletedDays}
              onBack={goBack}
              onOpenDays={async (iso) => {
                const s = iso || umbralStartedAt || new Date().toISOString();
                await saveUmbralStartedAt(s);
                navigate("umbral_days");
              }}
              onOpenProgress={() => navigate("progress")}
              onOpenCommunity={() => navigate("community")}
            />
          );
        case "umbral_days":
          return (
            <UmbralDaysScreen
              startedAtISO={umbralStartedAt}
              completedDays={umbralCompletedDays}
              onBack={goBack}
              onOpenDay={(d, iso) => {
                if (iso) saveUmbralStartedAt(iso);
                setSelectedUmbralDay(d);
                navigate("umbral_day");
              }}
            />
          );
        case "umbral_day":
          return (
            <UmbralDayScreen
              dayNumber={selectedUmbralDay}
              onBack={() => navigate("umbral_days")}
              onMarkComplete={async (d) => {
                await saveUmbralDay(d);
                await loadHabitStreak();
                navigate("progress");
              }}
            />
          );
        case "despertar":
          return (
            <DespertarScreen
              completedDays={despertarCompletedDays}
              startedAtISO={despertarStartedAt}
              onBack={goBack}
              onOpenDays={async () => {
                const iso = despertarStartedAt || new Date().toISOString();
                await saveDespertarStartedAt(iso);
                navigate("despertar_days");
              }}
            />
          );
        case "despertar_days":
          return (
            <DespertarDaysScreen
              startedAtISO={despertarStartedAt}
              completedDays={despertarCompletedDays}
              onBack={goBack}
              onOpenDay={(d) => {
                setSelectedDespertarDay(d);
                navigate("despertar_day");
              }}
            />
          );
        case "despertar_day":
          return (
            <DespertarDayScreen
              dayNumber={selectedDespertarDay}
              onBack={() => navigate("despertar_days")}
              onMarkComplete={async (d) => {
                await saveDespertarDay(d);
                await loadHabitStreak();
                navigate("progress");
              }}
            />
          );
        case "notifications":
          return <NotificationsScreen onBack={goBack} />;
        case "renewal":
          return <RenewalScreen member={member} onBack={goBack} />;
        case "meditaciones":
          return <MeditacionesScreen onBack={goBack} />;
        case "recetas":
          return <RecetasScreen onBack={goBack} />;
        case "ayuno":
          return <AyunoScreen member={member} onBack={goBack} />;
        case "chat":
          return (
            <ChatScreen
              member={member}
              umbralDay={umbralDay}
              completados={umbralCompletedDays.length}
              habitStreak={habitStreak}
              onBack={goBack}
            />
          );
        case "entrenamientos":
          return <EntrenamientosScreen onBack={goBack} />;
        case "sueno":
          return <SuenoScreen member={member} onBack={goBack} />;

        case "hidratacion":
          return <HidratacionScreen member={member} onBack={goBack} />;
        case "stats":
          return (
            <StatsScreen
              member={member}
              umbralCompletedDays={umbralCompletedDays}
              despertarCompletedDays={despertarCompletedDays}
              selectedProgram={selectedProgram}
              onBack={goBack}
            />
          );
        default:
          return null;
      }
    };
    return (
      <>
        <StatusBar style="light" />
        {renderSub()}
      </>
    );
  }


  // ── Racha días consecutivos del programa activo ──────────
  const completedActivos = selectedProgram === "despertar" ? despertarCompletedDays : umbralCompletedDays;
  const startedAtActivo  = selectedProgram === "despertar" ? despertarStartedAt    : umbralStartedAt;
  const diaActualReto    = startedAtActivo
    ? Math.max(1, Math.min(30, Math.floor((Date.now() - new Date(startedAtActivo)) / 86400000) + 1))
    : 1;

  let rachaPrograma = 0;
  for (let i = diaActualReto; i >= 1; i--) {
    if (completedActivos.includes(i)) rachaPrograma++;
    else break;
  }

  // ─── TABS PRINCIPALES ─────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {

      case "inicio":
        return (
          <HomeScreen
            member={member}
            selectedProgram={selectedProgram}
            umbralStartedAt={umbralStartedAt}
            umbralCompletedDays={umbralCompletedDays}
            bannerDiaPendiente={bannerDiaPendiente}
            xpTotal={xpTotal}
            despertarStartedAt={despertarStartedAt}
            despertarCompletedDays={despertarCompletedDays}
            onLogout={handleLogout}
            onOpenIdentity={() => navigate("identity")}
            onOpenUmbral={() => navigate("umbral")}
            onOpenDespertar={() => navigate("despertar")}
            onOpenProgress={() => navigate("progress")}
            onOpenMeasurements={() => navigate("measurements")}
            onOpenCommunity={() => navigate("community")}
            onOpenNotifications={() => navigate("notifications")}
            onOpenProfile={() => setActiveTab("perfil")}
            onOpenRenewal={() => navigate("renewal")}
            onOpenMeditaciones={() => navigate("meditaciones")}
            onOpenRecetas={() => navigate("recetas")}
            onOpenAyuno={() => navigate("ayuno")}
            onOpenChat={() => navigate("chat")}
            onOpenBiblioteca={() => setActiveTab("biblioteca")}
            onOpenEntrenamientos={() => navigate("entrenamientos")}
            onOpenHidratacion={() => navigate("hidratacion")}
            refreshKey={refreshKey}
          />
        );

      case "reto":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.retoHeader}>
              <Text style={styles.retoTitle}>Tu Programa</Text>
              <Text style={styles.retoSub}>
                {umbralActivo
                  ? "Mes 1 activo · El Despertar se activa el próximo mes."
                  : despertarActivo
                  ? "Mes 2 activo · El Umbral ya está completado."
                  : "Elegí tu programa del mes."}
              </Text>
            </View>

            {/* ── WIDGET RACHA ── */}
            {(umbralActivo || despertarActivo) && (() => {
              const colorReto = despertarActivo ? "#a78bfa" : "#c9a84c";
              const nombreReto = despertarActivo ? "EL DESPERTAR" : "EL UMBRAL";
              const completadosReto = completedActivos.length;
              const progresoPct = Math.round((completadosReto / 30) * 100);
              const emoji = rachaPrograma >= 7 ? "🔥" : rachaPrograma >= 3 ? "⚡" : "💪";
              return (
                <View style={[styles.rachaWidget, { borderColor: colorReto + "40" }]}>
                  {/* Fila superior */}
                  <View style={styles.rachaTopRow}>
                    <View style={[styles.rachaBadge, { backgroundColor: colorReto + "15", borderColor: colorReto + "40" }]}>
                      <Text style={[styles.rachaBadgeTxt, { color: colorReto }]}>{emoji} RACHA ACTIVA</Text>
                    </View>
                    <Text style={[styles.rachaNombrePrograma, { color: colorReto }]}>{nombreReto}</Text>
                  </View>

                  {/* Stats row */}
                  <View style={styles.rachaStatsRow}>
                    <View style={styles.rachaStatItem}>
                      <Text style={[styles.rachaStatNum, { color: colorReto }]}>{rachaPrograma}</Text>
                      <Text style={styles.rachaStatLabel}>días seguidos</Text>
                    </View>
                    <View style={styles.rachaStatDivider} />
                    <View style={styles.rachaStatItem}>
                      <Text style={[styles.rachaStatNum, { color: colorReto }]}>{diaActualReto}</Text>
                      <Text style={styles.rachaStatLabel}>día actual</Text>
                    </View>
                    <View style={styles.rachaStatDivider} />
                    <View style={styles.rachaStatItem}>
                      <Text style={[styles.rachaStatNum, { color: colorReto }]}>{completadosReto}</Text>
                      <Text style={styles.rachaStatLabel}>completados</Text>
                    </View>
                    <View style={styles.rachaStatDivider} />
                    <View style={styles.rachaStatItem}>
                      <Text style={[styles.rachaStatNum, { color: colorReto }]}>{progresoPct}%</Text>
                      <Text style={styles.rachaStatLabel}>progreso</Text>
                    </View>
                  </View>

                  {/* Barra progreso */}
                  <View style={styles.rachaProgressBg}>
                    <View style={[styles.rachaProgressFill, {
                      width: `${progresoPct}%`,
                      backgroundColor: colorReto,
                      shadowColor: colorReto,
                    }]} />
                  </View>

                  {/* Mensaje motivacional según racha */}
                  <Text style={styles.rachaMensaje}>
                    {rachaPrograma === 0
                      ? "Completá el día de hoy para arrancar tu racha 💪"
                      : rachaPrograma === 1
                      ? "¡Primer día! La racha empieza con uno."
                      : rachaPrograma < 7
                      ? `${rachaPrograma} días consecutivos. Seguís construyendo.`
                      : rachaPrograma < 14
                      ? `${rachaPrograma} días de racha. Esto ya es un hábito real.`
                      : `${rachaPrograma} días seguidos. Sos imparable.`}
                  </Text>
                </View>
              );
            })()}

            <View style={styles.retoBody}>
              <TouchableOpacity
                style={[
                  styles.retoCard,
                  umbralActivo && { borderColor: "rgba(201,168,76,0.5)" },
                  !umbralActivo && { opacity: 0.45 },
                ]}
                onPress={() => umbralActivo ? navigate("umbral") : null}
                activeOpacity={umbralActivo ? 0.88 : 1}
              >
                <View style={styles.retoCardTop}>
                  {umbralActivo ? (
                    <View style={styles.retoChipActivo}>
                      <Text style={styles.retoChipActivoTxt}>🔥 MES 1 · ACTIVO</Text>
                    </View>
                  ) : (
                    <View style={styles.retoChipBloqueado}>
                      <Text style={styles.retoChipBloqueadoTxt}>🔒 BLOQUEADO</Text>
                    </View>
                  )}
                  <Text style={styles.retoMeta}>
                    {umbralActivo ? `${umbralCompletedDays.length}/30 días` : "Disponible próximo mes"}
                  </Text>
                </View>
                <Text style={[styles.retoCardTitle, { color: umbralActivo ? "#c9a84c" : "#4a3a20" }]}>
                  EL UMBRAL
                </Text>
                <Text style={styles.retoCardSub}>
                  {umbralActivo
                    ? "Cruzá el límite que te mantuvo estancado. Un día a la vez."
                    : "Activaste El Despertar este mes. El Umbral vuelve el próximo ciclo."}
                </Text>
                {umbralActivo && (
                  <>
                    <View style={styles.retoPBg}>
                      <View style={[styles.retoPFill, {
                        width: `${(umbralCompletedDays.length / 30) * 100}%`,
                        backgroundColor: "#c9a84c",
                      }]} />
                    </View>
                    <View style={styles.retoBtn}>
                      <Text style={styles.retoBtnTxt}>Continuar El Umbral →</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.retoCard,
                  { borderColor: despertarActivo ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.15)" },
                  !despertarActivo && { opacity: 0.45 },
                ]}
                onPress={() => despertarActivo ? navigate("despertar") : null}
                activeOpacity={despertarActivo ? 0.88 : 1}
              >
                <View style={styles.retoCardTop}>
                  {despertarActivo ? (
                    <View style={[styles.retoChipActivo, {
                      backgroundColor: "rgba(167,139,250,0.15)",
                      borderColor: "rgba(167,139,250,0.4)",
                    }]}>
                      <Text style={[styles.retoChipActivoTxt, { color: "#a78bfa" }]}>🌅 MES 2 · ACTIVO</Text>
                    </View>
                  ) : (
                    <View style={styles.retoChipBloqueado}>
                      <Text style={styles.retoChipBloqueadoTxt}>🔒 BLOQUEADO</Text>
                    </View>
                  )}
                  <Text style={styles.retoMeta}>
                    {despertarActivo ? `${despertarCompletedDays.length}/30 días` : "Disponible próximo mes"}
                  </Text>
                </View>
                <Text style={[styles.retoCardTitle, { color: despertarActivo ? "#a78bfa" : "#4a3a20" }]}>
                  EL DESPERTAR
                </Text>
                <Text style={styles.retoCardSub}>
                  {despertarActivo
                    ? "La evolución después del Umbral. El siguiente nivel."
                    : "Activaste El Umbral este mes. El Despertar vuelve el próximo ciclo."}
                </Text>
                {despertarActivo && (
                  <>
                    <View style={styles.retoPBg}>
                      <View style={[styles.retoPFill, {
                        width: `${(despertarCompletedDays.length / 30) * 100}%`,
                        backgroundColor: "#a78bfa",
                      }]} />
                    </View>
                    <View style={[styles.retoBtn, { backgroundColor: "#a78bfa" }]}>
                      <Text style={styles.retoBtnTxt}>Continuar El Despertar →</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        );

      case "practicas":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.pracHeader}>
              <Text style={styles.pracTitle}>Prácticas</Text>
              <Text style={styles.pracSub}>Tus herramientas diarias de transformación</Text>
            </View>
            <View style={styles.pracBody}>

              {/* DASHBOARD DESTACADO */}
              <TouchableOpacity
                style={styles.dashCard}
                onPress={() => navigate("stats")}
                activeOpacity={0.88}
              >
                <View style={styles.dashCardLeft}>
                  <Text style={styles.dashCardLabel}>📊 MÉTRICAS · LOGROS · SCORE</Text>
                  <Text style={styles.dashCardTitulo}>Mi Dashboard</Text>
                  <Text style={styles.dashCardSub}>Sueño · Hábitos · Ayuno · Pasos · Badges</Text>
                </View>
                <Text style={styles.dashCardArrow}>→</Text>
              </TouchableOpacity>

              {[
                                { icon: "💪", titulo: "Entrenamientos",      desc: "Fausto Murillo · Mecha Box · HIIT · Movilidad",        color: "#f97316", fn: () => navigate("entrenamientos") },
                { icon: "🍽️", titulo: "Ayuno Intermitente", desc: "Protocolos 12h a 120h con etapas científicas",         color: "#fb923c", fn: () => navigate("ayuno") },
                { icon: "🧘", titulo: "Meditaciones",        desc: "5 meditaciones guiadas para tu práctica diaria",       color: "#e879f9", fn: () => navigate("meditaciones") },
                { icon: "📊", titulo: "Hábitos y Racha",     desc: `Racha actual: ${habitStreak} días consecutivos`,       color: "#c9a84c", fn: () => navigate("progress") },
                { icon: "📏", titulo: "Medidas Corporales",  desc: "Registrá tu evolución física con fotos",               color: "#a78bfa", fn: () => navigate("measurements") },
                { icon: "🌙", titulo: "Sueño",               desc: "Registrá tus horas y mantenés tu racha de descanso",   color: "#7c6fd4", fn: () => navigate("sueno") },
                { icon: "🥑", titulo: "Recetas Keto",        desc: "25 recetas con macros para cada objetivo",             color: "#4ade80", fn: () => navigate("recetas") },
                { icon: "💬", titulo: "Comunidad",           desc: "Conectá con otros miembros de Ketoclub",               color: "#60a5fa", fn: () => navigate("community") },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.pracCard, { borderColor: item.color + "40" }]}
                  onPress={item.fn}
                  activeOpacity={0.88}
                >
                  <View style={[styles.pracIconWrap, { backgroundColor: item.color + "15" }]}>
                    <Text style={styles.pracIcon}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pracCardTitulo, { color: item.color }]}>{item.titulo}</Text>
                    <Text style={styles.pracCardDesc}>{item.desc}</Text>
                  </View>
                  <Text style={[styles.pracArrow, { color: item.color }]}>→</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.chatCard} onPress={() => navigate("chat")} activeOpacity={0.88}>
                <View style={styles.chatCardDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatCardTitulo}>🤖 Keto Coach · 24/7</Text>
                  <Text style={styles.chatCardDesc}>Tu mentor IA personal disponible ahora</Text>
                </View>
                <Text style={styles.chatCardArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        );

      case "biblioteca":
        return <BibliotecaScreen onBack={() => setActiveTab("inicio")} />;

      case "perfil":
        return (
          <ProfileScreen
            member={member}
            umbralCompletedDays={umbralCompletedDays}
            umbralStartedAt={umbralStartedAt}
            habitStreak={habitStreak}
            xpTotal={xpTotal}
            memberKey={memberKey}
            onBack={() => setActiveTab("inicio")}
            onOpenMeasurements={() => navigate("measurements")}
          />
        );

      default:
        return null;
    }
  };

  // ─── RACHA ROTA ───────────────────────────────────────────
  if (rachaRota !== null) {
    return (
      <>
        <StatusBar style="light" />
        <RachaRotaScreen
          rachaAnterior={rachaRota}
          onRetomar={() => { setRachaRota(null); setActiveTab("practicas"); }}
          onCerrar={() => setRachaRota(null)}
        />
      </>
    );
  }

  // ─── RESUMEN SEMANAL ──────────────────────────────────────
  if (resumenSemana && selectedProgram) {
    const startedAt = selectedProgram === 'despertar' ? despertarStartedAt : umbralStartedAt;
    const completed = selectedProgram === 'despertar' ? despertarCompletedDays : umbralCompletedDays;
    return (
      <>
        <StatusBar style="light" />
        <ResumenSemanalScreen
          member={member}
          semana={resumenSemana}
          programa={selectedProgram}
          completedDays={completed}
          startedAtISO={startedAt}
          onContinuar={() => setResumenSemana(null)}
        />
      </>
    );
  }

  return (
    <ErrorBoundary onReset={handleLogout}>
      <View style={styles.appContainer}>
        <StatusBar style="light" />
        <View style={styles.screenContainer}>{renderTab()}</View>
        <TabBar activeTab={activeTab} onSelect={setActiveTab} badgeReto={badgeReto} />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: "#0a0a0c" },
  screenContainer: { flex: 1 },
  tabContent: { flex: 1, backgroundColor: "#0a0a0c" },

  retoHeader: {
    backgroundColor: "#1a1508", padding: 24, paddingTop: 56,
    borderBottomWidth: 1, borderBottomColor: "rgba(201,168,76,0.15)",
  },
  retoTitle: { fontSize: 28, fontWeight: "900", color: "#f0e6c8", marginBottom: 4 },
  retoSub: { fontSize: 13, color: "#6a5a40" },
  retoBody: { padding: 16, gap: 14 },
  retoCard: {
    backgroundColor: "#13120f", borderRadius: 20, padding: 20,
    borderWidth: 1.5, borderColor: "rgba(201,168,76,0.2)",
  },
  retoCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  retoChipActivo: {
    backgroundColor: "rgba(201,168,76,0.15)", borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.4)", borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  retoChipActivoTxt: { color: "#c9a84c", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  retoChipBloqueado: {
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  retoChipBloqueadoTxt: { color: "#4a3a20", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  retoMeta: { color: "#6a5a40", fontSize: 12, fontWeight: "700" },
  retoCardTitle: { fontSize: 24, fontWeight: "900", marginBottom: 6 },
  retoCardSub: { fontSize: 13, color: "#6a5a40", lineHeight: 20, marginBottom: 14 },
  retoPBg: { backgroundColor: "#1e1e18", borderRadius: 8, height: 8, marginBottom: 14 },
  retoPFill: { borderRadius: 8, height: 8 },
  retoBtn: { backgroundColor: "#c9a84c", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  retoBtnTxt: { color: "#0a0a0c", fontWeight: "900", fontSize: 14 },

  pracHeader: {
    backgroundColor: "#1a1508", padding: 24, paddingTop: 56,
    borderBottomWidth: 1, borderBottomColor: "rgba(201,168,76,0.15)",
  },
  pracTitle: { fontSize: 28, fontWeight: "900", color: "#f0e6c8", marginBottom: 4 },
  pracSub: { fontSize: 13, color: "#6a5a40" },
  pracBody: { padding: 16, gap: 12 },

  dashCard: {
    backgroundColor: "#130f0a", borderRadius: 18, borderWidth: 2,
    borderColor: "rgba(201,168,76,0.45)", padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#c9a84c", shadowOpacity: 0.15,
    shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  dashCardLeft: { flex: 1 },
  dashCardLabel: { fontSize: 9, color: "#c9a84c", fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  dashCardTitulo: { fontSize: 20, fontWeight: "900", color: "#f0e6c8", marginBottom: 3 },
  dashCardSub: { fontSize: 12, color: "#6a5a40" },
  dashCardArrow: { fontSize: 22, color: "#c9a84c", fontWeight: "900" },

  pracCard: {
    backgroundColor: "#13120f", borderRadius: 16, borderWidth: 1.5,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 14,
  },
  pracIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pracIcon: { fontSize: 24 },
  pracCardTitulo: { fontSize: 15, fontWeight: "900", marginBottom: 3 },
  pracCardDesc: { fontSize: 12, color: "#6a5a40", lineHeight: 18 },
  pracArrow: { fontSize: 18, fontWeight: "900", flexShrink: 0 },

  chatCard: {
    backgroundColor: "#0a1a0a", borderRadius: 16, borderWidth: 2,
    borderColor: "rgba(74,222,128,0.45)", padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  chatCardDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4ade80", flexShrink: 0 },
  chatCardTitulo: { fontSize: 15, fontWeight: "900", color: "#f0e6c8", marginBottom: 3 },
  chatCardDesc: { fontSize: 12, color: "#4a6a4a" },
  chatCardArrow: { fontSize: 18, color: "#4ade80", fontWeight: "900", flexShrink: 0 },

  // ── Widget racha ─────────────────────────────────────────
  rachaWidget: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    backgroundColor: "#13120f", borderRadius: 20, borderWidth: 1.5,
    padding: 18,
  },
  rachaTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  rachaBadge: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  rachaBadgeTxt: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  rachaNombrePrograma: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  rachaStatsRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  rachaStatItem: { flex: 1, alignItems: "center" },
  rachaStatNum: { fontSize: 26, fontWeight: "900", marginBottom: 2 },
  rachaStatLabel: { fontSize: 10, color: "#6a5a40", fontWeight: "700" },
  rachaStatDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.06)" },
  rachaProgressBg: { backgroundColor: "#1e1e18", borderRadius: 8, height: 8, marginBottom: 12 },
  rachaProgressFill: {
    borderRadius: 8, height: 8,
    shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  rachaMensaje: { fontSize: 13, color: "#6a5a40", fontStyle: "italic", textAlign: "center" },
});