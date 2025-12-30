import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import HealHubLogo from '../components/HealHubLogo';

const SplashScreenComponent = ({ onFinish }: { onFinish: () => void }) => {
    const fadeOutAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start fade out animation after 3 seconds
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeOutAnim, {
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
                // Notify parent component
                onFinish();
            });
        }, 3000);

        // Clean up timer
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    opacity: fadeOutAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <HealHubLogo />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
});

export default SplashScreenComponent;