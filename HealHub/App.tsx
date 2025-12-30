import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Animated } from 'react-native';
import HealHubLogo from './components/HealHubLogo';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Always show splash screen for 3 seconds when app starts
    const timer = setTimeout(() => {
      // Start fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSplash(false);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Reset splash screen state when component mounts
  useEffect(() => {
    setShowSplash(true);
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
  }, []);

  if (showSplash) {
    return (
      <Animated.View 
        style={[
          styles.splashContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="#f8f9fa"
          translucent={false}
        />
        <HealHubLogo />
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#f8f9fa"
        translucent={false}
      />
      
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome to HealHub!</Text>
        <Text style={styles.subtitle}>
          Your healthcare companion app is ready.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Health Tracking</Text>
          <Text style={styles.featureItem}>• Appointment Scheduling</Text>
          <Text style={styles.featureItem}>• Medical Records Access</Text>
          <Text style={styles.featureItem}>• Virtual Consultations</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 5,
  },
});