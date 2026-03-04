import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface MapViewerProps {
  locations: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    imageUrl?: string;
  }>;
  height?: string;
}

export const MapViewer = ({ locations, height = "500px" }: MapViewerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => toast.error("Failed to load Google Maps");
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || locations.length === 0) return;

      const center = locations[0];
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 12,
      });

      const bounds = new window.google.maps.LatLngBounds();

      locations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.title,
        });

        bounds.extend({ lat: location.lat, lng: location.lng });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px;">
              ${location.imageUrl ? `<img src="${location.imageUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
              <h3 style="font-weight: bold; margin-bottom: 4px;">${location.title}</h3>
              ${location.description ? `<p style="font-size: 14px; color: #666;">${location.description}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      if (locations.length > 1) {
        map.fitBounds(bounds);
      }
    };

    loadGoogleMaps();
  }, [locations]);

  return (
    <Card className="p-4">
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />
    </Card>
  );
};
