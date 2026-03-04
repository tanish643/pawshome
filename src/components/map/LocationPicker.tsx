import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

export const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = { lat: 40.7128, lng: -74.0060 },
  height = "400px" 
}: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [marker, setMarker] = useState<any | null>(null);
  const geocoderRef = useRef<any | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => toast.error("Failed to load Google Maps");
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 13,
      });

      geocoderRef.current = new window.google.maps.Geocoder();

      const markerInstance = new window.google.maps.Marker({
        position: initialLocation,
        map: mapInstance,
        draggable: true,
      });

      window.google.maps.event.addListener(markerInstance, 'dragend', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          getAddress(lat, lng);
        }
      });

      mapInstance.addListener('click', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          markerInstance.setPosition({ lat, lng });
          getAddress(lat, lng);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      getAddress(initialLocation.lat, initialLocation.lng);
    };

    const getAddress = (lat: number, lng: number) => {
      if (!geocoderRef.current) return;

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            onLocationSelect({
              lat,
              lng,
              address: results[0].formatted_address,
            });
          }
        }
      );
    };

    loadGoogleMaps();
  }, []);

  return (
    <Card className="p-4">
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />
      <p className="text-sm text-muted-foreground mt-2">
        Click or drag the marker to select a location
      </p>
    </Card>
  );
};
