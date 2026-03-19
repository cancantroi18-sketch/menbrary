declare global {
  interface Window {
    google?: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: google.maps.MapOptions);
    }
    class Marker {
      constructor(opts?: google.maps.MarkerOptions);
      setMap(map: google.maps.Map | null): void;
      addListener(eventName: string, handler: () => void): void;
    }
    class InfoWindow {
      constructor(opts?: { content?: string });
      open(map?: google.maps.Map, anchor?: unknown): void;
      close(): void;
    }
    interface MapOptions {
      center?: { lat: number; lng: number };
      zoom?: number;
    }
    interface MarkerOptions {
      position?: { lat: number; lng: number };
      map?: google.maps.Map;
      title?: string;
      icon?: object;
    }
    interface MVCObject {
      // minimal for InfoWindow.open
    }
    namespace SymbolPath {
      const CIRCLE: unknown;
    }
  }
}
