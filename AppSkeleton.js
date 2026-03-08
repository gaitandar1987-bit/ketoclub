import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ── Bloque animado base ──────────────────────────────────────
function SkeletonBlock({ style }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.block, style, { opacity: anim }]}
    />
  );
}

// ── Skeleton pantalla Home ───────────────────────────────────
export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonBlock style={styles.avatar} />
          <View style={{ gap: 8 }}>
            <SkeletonBlock style={{ width: 140, height: 18, borderRadius: 9 }} />
            <SkeletonBlock style={{ width: 90, height: 12, borderRadius: 6 }} />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Widget hidratación */}
        <SkeletonBlock style={styles.card} />
        {/* Widget pasos */}
        <SkeletonBlock style={styles.card} />
        {/* Grid */}
        <View style={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} style={styles.gridItem} />
          ))}
        </View>
        {/* Programa */}
        <SkeletonBlock style={{ ...styles.card, height: 160 }} />
      </View>
    </View>
  );
}

// ── Skeleton pantalla genérica (lista de cards) ──────────────
export function ListSkeleton({ count = 4 }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SkeletonBlock style={{ width: 180, height: 22, borderRadius: 11 }} />
        <SkeletonBlock style={{ width: 120, height: 14, borderRadius: 7, marginTop: 8 }} />
      </View>
      <View style={styles.body}>
        {[...Array(count)].map((_, i) => (
          <SkeletonBlock key={i} style={{ ...styles.card, height: 90 }} />
        ))}
      </View>
    </View>
  );
}

// ── Skeleton pantalla Perfil ─────────────────────────────────
export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.header, { alignItems: 'center', gap: 12 }]}>
        <SkeletonBlock style={styles.avatarLarge} />
        <SkeletonBlock style={{ width: 150, height: 20, borderRadius: 10 }} />
        <SkeletonBlock style={{ width: 100, height: 14, borderRadius: 7 }} />
      </View>
      <View style={styles.body}>
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} style={{ ...styles.card, height: 64 }} />
        ))}
      </View>
    </View>
  );
}

// ── Loading spinner minimal ──────────────────────────────────
export function LoadingOverlay() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.spinner, {
        transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }]
      }]}>⏳</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0a0a0c' },
  header:      { backgroundColor: '#1a1508', padding: 24, paddingTop: 56 },
  body:        { padding: 16, gap: 12 },
  block:       { backgroundColor: '#2a2010', borderRadius: 12 },
  avatar:      { width: 54, height: 54, borderRadius: 27 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40 },
  card:        { width: '100%', height: 80, borderRadius: 18 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem:    { width: (width - 52) / 3, height: 80, borderRadius: 16 },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,12,0.7)', alignItems: 'center', justifyContent: 'center' },
  spinner:     { fontSize: 40 },
});
