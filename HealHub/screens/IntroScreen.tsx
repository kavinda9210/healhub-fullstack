import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Slide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const slides: Slide[] = [
    {
      id: '1',
      titleKey: 'intro.medicine_reminder.title',
      descriptionKey: 'intro.medicine_reminder.description',
      icon: '💊',
      color: '#4A90E2',
      backgroundColor: '#E8F2FF',
    },
    {
      id: '2',
      titleKey: 'intro.ai_detection.title',
      descriptionKey: 'intro.ai_detection.description',
      icon: '🤖',
      color: '#FF6B6B',
      backgroundColor: '#FFEEEE',
    },
    {
      id: '3',
      titleKey: 'intro.ambulance_find.title',
      descriptionKey: 'intro.ambulance_find.description',
      icon: '🚑',
      color: '#2E8B57',
      backgroundColor: '#E8F5E9',
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const skipIntro = () => {
    onComplete();
  };

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: item.color }]}>{item.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: item.color }]}>
            {t(item.titleKey)}
          </Text>
          <Text style={styles.description}>
            {t(item.descriptionKey)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationDots}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: slides[index].color,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipIntro}>
        <Text style={styles.skipText}>{t('intro.skip', 'Skip')}</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: slides[currentIndex].color }]}
          onPress={scrollTo}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1
              ? t('intro.get_started', 'Get Started')
              : t('intro.next', 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  nextButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default IntroScreen;