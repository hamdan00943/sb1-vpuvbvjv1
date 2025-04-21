import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Animation values
  const scanAnimation = useSharedValue(0);
  const resultScale = useSharedValue(0);

  useEffect(() => {
    requestPermissions();
    initTensorFlow();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const hasAllPermissions = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        setHasPermission(hasAllPermissions);
      } catch (err) {
        console.warn(err);
        Alert.alert('Permission Error', 'Failed to get required permissions');
      }
    }
  };

  const initTensorFlow = async () => {
    try {
      await tf.ready();
      console.log('TensorFlow.js is ready');
    } catch (error) {
      console.error('Failed to initialize TensorFlow:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchRecyclingCenters(latitude, longitude);
      },
      error => {
        console.error(error);
        Alert.alert('Location Error', 'Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchRecyclingCenters = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/search/recycling.json?key=${process.env.VITE_TOMTOM_API_KEY}&lat=${latitude}&lon=${longitude}&radius=10000`
      );
      const data = await response.json();
      setRecyclingCenters(data.results);
    } catch (error) {
      console.error('Failed to fetch recycling centers:', error);
    }
  };

  const takePicture = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required');
      return;
    }

    try {
      scanAnimation.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );

      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      setCapturedImage(data.uri);
      analyzeImage(data.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const analyzeImage = async (imageUri) => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis for now
      // In production, implement actual TensorFlow.js analysis
      setTimeout(() => {
        setScanResult({
          recyclable: true,
          confidence: 0.89,
          materials: [
            { name: 'Plastic', percentage: 60, recyclable: true },
            { name: 'Metal', percentage: 30, recyclable: true },
            { name: 'Other', percentage: 10, recyclable: false },
          ],
        });
        resultScale.value = withSpring(1);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to analyze image');
    }
  };

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanAnimation.value * 200 }],
    opacity: 1 - scanAnimation.value,
  }));

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultScale.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {cameraVisible ? (
        <View style={styles.cameraContainer}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.camera}
            type={RNCamera.Constants.Type.back}
            captureAudio={false}
          >
            <Animated.View style={[styles.scanLine, scanAnimatedStyle]} />
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Icon name="camera" size={30} color="#fff" />
            </TouchableOpacity>
          </RNCamera>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCameraVisible(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <Icon name="recycle" size={24} color="#4CAF50" />
            <Text style={styles.title}>EcoScan</Text>
          </View>

          {capturedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            </View>
          )}

          {scanResult && (
            <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
              <Text style={styles.resultTitle}>
                {scanResult.recyclable ? '♻️ Recyclable' : '⚠️ Not Recyclable'}
              </Text>
              <Text style={styles.confidence}>
                Confidence: {Math.round(scanResult.confidence * 100)}%
              </Text>
              {scanResult.materials.map((material, index) => (
                <View key={index} style={styles.materialItem}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <View style={styles.percentageBar}>
                    <View
                      style={[
                        styles.percentageFill,
                        {
                          width: `${material.percentage}%`,
                          backgroundColor: material.recyclable ? '#4CAF50' : '#F44336',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentage}>{material.percentage}%</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {userLocation && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={userLocation}
                  title="You are here"
                  pinColor="#4CAF50"
                />
                {recyclingCenters.map((center, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: center.position.lat,
                      longitude: center.position.lon,
                    }}
                    title={center.poi.name}
                    description={center.address.freeformAddress}
                  />
                ))}
              </MapView>
            </View>
          )}

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setCameraVisible(true)}
          >
            <Icon name="camera" size={24} color="#fff" />
            <Text style={styles.buttonText}>Scan Device</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2E7D32',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanLine: {
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
    position: 'absolute',
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 40,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  imagePreview: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  confidence: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialName: {
    width: 80,
    fontSize: 14,
  },
  percentageBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    width: 40,
    fontSize: 12,
    textAlign: 'right',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default App;