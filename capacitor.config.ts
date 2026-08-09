import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.momusic.android',
  appName: 'MoMusic',
  webDir: 'www',
  android: {
    allowMixedContent: true
  },
  plugins: {
    Nodejs: {
      nodeDir: 'nodejs',
      startMode: 'auto'
    }
  }
};

export default config;
