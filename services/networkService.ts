
import { Network } from '@capacitor/network';

class NetworkService {
  public isOnline: boolean = true;
  private listeners: ((status: boolean) => void)[] = [];

  constructor() {
    this.init();
  }

  async init() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      this.notifyListeners();

      Network.addListener('networkStatusChange', (status) => {
        const prev = this.isOnline;
        this.isOnline = status.connected;
        if (prev !== this.isOnline) {
            console.log(`📡 Network Status Changed: ${this.isOnline ? 'Online' : 'Offline'}`);
            this.notifyListeners();
        }
      });
    } catch (e) {
      console.warn("Network plugin not available, assuming online.");
      this.isOnline = true;
    }
  }

  subscribe(callback: (status: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.isOnline); // Initial value
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.isOnline));
  }
}

export const networkService = new NetworkService();
