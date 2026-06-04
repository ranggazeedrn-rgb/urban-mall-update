import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

// The URL of your published/shared web application
const MALL_APP_URL = 'https://ais-pre-xqj6vsvbhq6sr6rro2qovf-914517633612.asia-southeast1.run.app';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.logoText}>URBAN<Text style={styles.logoSubtext}>MALL</Text></Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MOBILE LIVE</Text>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        <WebView 
          source={{ uri: MALL_APP_URL }}
          onLoadEnd={() => setIsLoading(false)}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>ELEVATING YOUR EXPERIENCE...</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    color: '#000000',
  },
  logoSubtext: {
    color: '#a1a1aa',
    fontWeight: '400',
  },
  badge: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#a1a1aa',
  }
});
