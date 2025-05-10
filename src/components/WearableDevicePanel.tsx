
import { WearableMetrics } from '@/hooks/useWearableDevice';
import { Bluetooth, BluetoothConnected, BluetoothOff, Heart, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WearableDevicePanelProps {
  metrics: WearableMetrics;
  isConnected: boolean;
  isScanning: boolean;
  isAvailable: boolean;
  onStartScanning: () => Promise<boolean>;
  onDisconnect: () => boolean;
}

export const WearableDevicePanel = ({
  metrics,
  isConnected,
  isScanning,
  isAvailable,
  onStartScanning,
  onDisconnect
}: WearableDevicePanelProps) => {
  return (
    <Card className="bg-[#132920] border-[#2E9E83]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg flex items-center justify-between">
          <span>Wearable Device</span>
          {isConnected ? (
            <BluetoothConnected className="text-[#7CE0C6]" />
          ) : (
            <BluetoothOff className="text-[#2E9E83]" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isAvailable ? (
          <div className="p-4 text-center">
            <p className="text-yellow-400 mb-2">Bluetooth not available</p>
            <p className="text-sm text-gray-400">Your browser doesn't support Bluetooth connectivity</p>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#143024] rounded-md p-3 flex items-center gap-2">
                <Heart className="text-red-400" size={18} />
                <div>
                  <div className="text-xs text-gray-300">Heart Rate</div>
                  <div className="text-sm font-medium text-white">{metrics.heartRate} BPM</div>
                </div>
              </div>
              
              <div className="bg-[#143024] rounded-md p-3 flex items-center gap-2">
                <Watch className="text-blue-400" size={18} />
                <div>
                  <div className="text-xs text-gray-300">Steps</div>
                  <div className="text-sm font-medium text-white">{metrics.steps}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#143024] rounded-md p-2">
                <div className="text-xs text-gray-300">Body Temp</div>
                <div className="text-sm font-medium text-white">{metrics.bodyTemperature}°C</div>
              </div>
              
              <div className="bg-[#143024] rounded-md p-2">
                <div className="text-xs text-gray-300">Blood O₂</div>
                <div className="text-sm font-medium text-white">{metrics.bloodOxygen}%</div>
              </div>
            </div>
            
            <div className="bg-[#143024] rounded-md p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300">Energy Level</span>
                <span className={`text-xs font-medium ${
                  metrics.energyLevel === 'high' 
                    ? 'text-red-400' 
                    : metrics.energyLevel === 'low' 
                      ? 'text-blue-400' 
                      : 'text-[#7CE0C6]'
                }`}>
                  {metrics.energyLevel.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 w-full bg-[#0A1A14] rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    metrics.energyLevel === 'high' 
                      ? 'bg-red-400' 
                      : metrics.energyLevel === 'low' 
                        ? 'bg-blue-400' 
                        : 'bg-[#7CE0C6]'
                  }`}
                  style={{ 
                    width: metrics.energyLevel === 'high' 
                      ? '90%' 
                      : metrics.energyLevel === 'low' 
                        ? '30%' 
                        : '60%' 
                  }}
                ></div>
              </div>
            </div>
            
            <Button 
              onClick={onDisconnect}
              variant="outline" 
              size="sm"
              className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
            >
              Disconnect Device
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="flex justify-center">
              <Bluetooth size={32} className="text-[#2E9E83]" />
            </div>
            <p className="text-sm text-gray-300">Connect to your wearable device to monitor your vitals</p>
            <Button
              onClick={onStartScanning}
              disabled={isScanning}
              className="bg-[#2E9E83] hover:bg-[#39BF9D] text-white"
            >
              {isScanning ? 'Scanning...' : 'Connect Device'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WearableDevicePanel;
