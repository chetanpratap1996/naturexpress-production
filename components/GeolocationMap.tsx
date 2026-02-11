'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  data: string;
  plotSize?: 'Small' | 'Medium' | 'Large';
}

const GeolocationMap: React.FC<Props> = ({ data, plotSize = 'Small' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  // Dynamically load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        const L = await import('leaflet');
        
        // Fix default marker icon issue in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setLeaflet(L);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Map library failed to load');
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current || !leaflet || isLoading) return;

    try {
      // Initialize Map if it doesn't exist
      if (!mapInstance.current) {
        mapInstance.current = leaflet.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      // Clear previous layer
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }

      // Parse and render data
      if (data && data.trim().length > 0) {
        setError(null);

        if (plotSize === 'Small') {
          // Parse coordinates: "Lat, Long" or "12.34, 56.78"
          const coordMatch = data.match(/-?\d+(\.\d+)?/g);
          
          if (coordMatch && coordMatch.length >= 2) {
            const lat = parseFloat(coordMatch[0]);
            const lng = parseFloat(coordMatch[1]);

            if (!isNaN(lat) && !isNaN(lng) && 
                lat >= -90 && lat <= 90 && 
                lng >= -180 && lng <= 180) {
              
              // Create marker
              layerRef.current = leaflet.circleMarker([lat, lng], {
                radius: 10,
                fillColor: '#22c55e', // green-600
                color: '#ffffff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.8,
              })
              .bindPopup(`<b>GPS Location</b><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
              .addTo(map);

              map.setView([lat, lng], 15);
            } else {
              setError('Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.');
            }
          } else {
            setError('Invalid coordinate format. Expected: "Latitude, Longitude"');
          }
        } else {
          // Parse GeoJSON for larger plots
          try {
            const json = JSON.parse(data);
            
            const geoJsonLayer = leaflet.geoJSON(json, {
              style: {
                color: '#22c55e',
                weight: 3,
                opacity: 1,
                fillColor: '#86efac',
                fillOpacity: 0.3,
              },
              onEachFeature: (feature: any, layer: any) => {
                if (feature.properties) {
                  const popupContent = Object.entries(feature.properties)
                    .map(([key, value]) => `<b>${key}:</b> ${value}`)
                    .join('<br/>');
                  layer.bindPopup(popupContent);
                }
              },
            });

            if (geoJsonLayer.getLayers().length > 0) {
              layerRef.current = geoJsonLayer.addTo(map);
              map.fitBounds(geoJsonLayer.getBounds(), { padding: [30, 30] });
            } else {
              setError('GeoJSON contains no valid features');
            }
          } catch (e) {
            setError('Invalid GeoJSON format');
          }
        }
      }
    } catch (err) {
      console.error('Map rendering error:', err);
      setError('Failed to render map');
    }
  }, [data, plotSize, leaflet, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 mt-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-64 bg-red-50 rounded-lg overflow-hidden border border-red-200 mt-4 flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
          <p className="text-sm font-semibold text-red-800 mb-1">Map Error</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 mt-4 shadow-lg">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Map overlay info */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md z-[1000] pointer-events-none">
        <div className="flex items-center gap-2">
          <MapPin className="text-green-600" size={14} />
          <span className="text-xs font-semibold text-gray-700">
            {plotSize === 'Small' ? 'Point Location' : 'Area Boundary'}
          </span>
        </div>
      </div>

      {/* Preview label */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] text-white rounded z-[1000] pointer-events-none font-mono">
        PREVIEW
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 text-[9px] text-gray-500 rounded z-[1000] pointer-events-none">
        OpenStreetMap
      </div>
    </div>
  );
};

export default GeolocationMap;