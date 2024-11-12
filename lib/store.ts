type Subscriber = (update: any) => void;

class SearchUpdatesStore {
  private subscribers: Map<string, Set<Subscriber>> = new Map();

  subscribe(searchId: string, callback: Subscriber) {
    if (!this.subscribers.has(searchId)) {
      this.subscribers.set(searchId, new Set());
    }
    this.subscribers.get(searchId)?.add(callback);

    return () => {
      this.subscribers.get(searchId)?.delete(callback);
      if (this.subscribers.get(searchId)?.size === 0) {
        this.subscribers.delete(searchId);
      }
    };
  }

  publish(searchId: string, update: any) {
    this.subscribers.get(searchId)?.forEach(callback => {
      callback(update);
    });
  }
}

export const searchUpdatesStore = new SearchUpdatesStore(); 