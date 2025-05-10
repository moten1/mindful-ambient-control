
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type WearableMetrics = {
  heartRate: number; // beats per minute
  bodyTemperature: number; // celsius
  bloodOxygen: number; // percentage
  steps: number;
  energyLevel: 'low' | 'medium' | 'high';
  isConnected: boolean;
};

export const useWearableDevice = () => {
  const [metrics, setMetrics] = useState<WearableMetrics>({
    heartRate: 75,
    bodyTemperature: 36.6,
    bloodOxygen: 98,
    steps: 0,
    energyLevel: 'medium',
    isConnected: false
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check if Bluetooth API is available
  const isBluetoothAvailable = 'bluetooth' in navigator;
  
  // Scan for compatible wearable devices
  const startScanning = async () => {
    if (!isBluetoothAvailable) {
      setError('Bluetooth is not available in this browser');
      toast({
        title: "Bluetooth Unavailable",
        description: "Bluetooth functionality is not supported in your browser",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsScanning(true);
      toast({
        title: "Scanning",
        description: "Looking for wearable devices..."
      });
      
      // Attempt to connect to a Bluetooth device
      // In a real app, we'd filter for specific services here
      // @ts-ignore - Using Web Bluetooth API which may not be in all TypeScript definitions
      const device = await navigator.bluetooth.requestDevice({
        // Filter for devices with health services
        filters: [
          { services: ['heart_rate'] },
          { services: ['health_thermometer'] },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Galaxy Watch' }
        ],
        optionalServices: ['battery_service', 'heart_rate']
      });
      
      setDeviceId(device.id);
      
      // Connect to device and begin reading data
      await connectToDevice(device);
      
      return true;
    } catch (err) {
      setError('Failed to scan for wearable devices');
      console.error('Bluetooth error:', err);
      toast({
        title: "Connection Failed",
        description: "Could not connect to a wearable device",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsScanning(false);
    }
  };
  
  // Connect to a selected wearable device
  const connectToDevice = async (device: any) => {
    try {
      toast({
        title: "Connecting",
        description: `Connecting to ${device.name || 'wearable device'}...`
      });
      
      // In a real app, we'd connect to the device and set up data listeners here
      // Simulating connection for demo purposes
      setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          isConnected: true
        }));
        
        toast({
          title: "Connected",
          description: `Successfully connected to ${device.name || 'wearable device'}`
        });
        
        // Start simulated data updates
        startDataSimulation();
      }, 1500);
      
      return true;
    } catch (err) {
      setError('Failed to connect to device');
      toast({
        title: "Connection Error",
        description: "Failed to connect to wearable device",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Disconnect from the wearable device
  const disconnect = () => {
    if (metrics.isConnected) {
      // In a real app, we would disconnect from the Bluetooth device here
      setMetrics(prev => ({
        ...prev,
        isConnected: false
      }));
      
      setDeviceId(null);
      
      toast({
        title: "Disconnected",
        description: "Wearable device has been disconnected"
      });
      
      return true;
    }
    return false;
  };
  
  // Simulate wearable device data updates
  // In a real app, this data would come from the actual wearable device
  const startDataSimulation = () => {
    const intervalId = setInterval(() => {
      if (!metrics.isConnected) {
        clearInterval(intervalId);
        return;
      }
      
      setMetrics(prev => {
        // Simulate minor fluctuations in heart rate
        const heartRateChange = (Math.random() * 6) - 3;
        const newHeartRate = Math.round(Math.max(60, Math.min(100, prev.heartRate + heartRateChange)));
        
        // Simulate very small fluctuations in body temperature
        const tempChange = (Math.random() * 0.2) - 0.1;
        const newTemp = parseFloat((prev.bodyTemperature + tempChange).toFixed(1));
        
        // Simulate blood oxygen fluctuations
        const oxygenChange = (Math.random() * 2) - 1;
        const newOxygen = Math.round(Math.max(94, Math.min(100, prev.bloodOxygen + oxygenChange)));
        
        // Simulate steps increasing over time
        const newSteps = prev.steps + Math.floor(Math.random() * 5);
        
        // Determine energy level based on heart rate and steps
        let energyLevel: WearableMetrics['energyLevel'] = 'medium';
        if (newHeartRate > 85) energyLevel = 'high';
        else if (newHeartRate < 70) energyLevel = 'low';
        
        return {
          heartRate: newHeartRate,
          bodyTemperature: newTemp,
          bloodOxygen: newOxygen,
          steps: newSteps,
          energyLevel,
          isConnected: true
        };
      });
    }, 3000);
    
    // Store interval ID for cleanup
    return () => clearInterval(intervalId);
  };
  
  // Clean up on unmount
  useEffect(() => {
    const cleanup = metrics.isConnected ? startDataSimulation() : undefined;
    
    return () => {
      if (cleanup) cleanup();
      if (metrics.isConnected) disconnect();
    };
  }, [metrics.isConnected]);
  
  return {
    metrics,
    isScanning,
    isConnected: metrics.isConnected,
    isAvailable: isBluetoothAvailable,
    startScanning,
    disconnect,
    error
  };
};

export default useWearableDevice;
