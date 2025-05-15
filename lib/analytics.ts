type EventType = 'search' | 'view_result' | 'save_result' | 'share_result' | 'provider_click' | 'search_saved';

interface EventProperties {
  [key: string]: any;
}

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      action: any,
      params?: any
    ) => void;
  }
}

const GA_TRACKING_ID = 'G-YTQPP7RV81';

class Analytics {
  private static instance: Analytics;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  trackEvent(eventType: EventType, properties: EventProperties = {}) {
    if (typeof window === 'undefined') return;

    try {
      window.gtag('event', eventType, {
        ...properties,
        event_category: 'User Interaction',
        event_label: properties.label || eventType,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  trackPageView(path: string) {
    if (typeof window === 'undefined') return;

    try {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: path,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  trackSearch(query: string, resultCount: number) {
    this.trackEvent('search', {
      search_term: query,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    });
  }

  trackResultView(resultId: string, resultName: string) {
    this.trackEvent('view_result', {
      result_id: resultId,
      result_name: resultName,
      timestamp: new Date().toISOString(),
    });
  }

  trackResultSave(resultId: string, resultName: string) {
    this.trackEvent('save_result', {
      result_id: resultId,
      result_name: resultName,
      timestamp: new Date().toISOString(),
    });
  }

  trackResultShare(resultId: string, resultName: string) {
    this.trackEvent('share_result', {
      result_id: resultId,
      result_name: resultName,
      timestamp: new Date().toISOString(),
    });
  }

  trackProviderClick(providerId: string, providerName: string, url: string) {
    this.trackEvent('provider_click', {
      provider_id: providerId,
      provider_name: providerName,
      provider_url: url,
      timestamp: new Date().toISOString(),
    });
  }
}

export const analytics = Analytics.getInstance(); 