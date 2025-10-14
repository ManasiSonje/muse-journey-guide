import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Museum } from '@/hooks/useMuseums';

// You'll need to add your Mapbox token as a secret in Supabase
const MAPBOX_TOKEN = 'pk.eyJ1IjoibXVzZW1hdGUiLCJhIjoiY2x0ZXh0ZXN0In0.example'; // Placeholder - needs to be replaced

interface TripPlannerMapProps {
  museums: Museum[];
  cityCenter: { lat: number; lng: number };
}

const TripPlannerMap: React.FC<TripPlannerMapProps> = ({ museums, cityCenter }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [cityCenter.lng, cityCenter.lat],
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add full screen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Cleanup previous markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each museum
    museums.forEach((museum, index) => {
      if (museum.latitude && museum.longitude) {
        const lat = typeof museum.latitude === 'string' ? parseFloat(museum.latitude) : museum.latitude;
        const lng = typeof museum.longitude === 'string' ? parseFloat(museum.longitude) : museum.longitude;

        if (!isNaN(lat) && !isNaN(lng)) {
          // Create marker element
          const el = document.createElement('div');
          el.className = 'museum-marker';
          el.innerHTML = `
            <div class="marker-content">
              <div class="marker-number">${index + 1}</div>
            </div>
          `;
          
          // Add marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="marker-popup">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">${museum.name}</h3>
                    <p style="font-size: 0.875rem; color: #666;">${museum.type || 'Museum'}</p>
                    <p style="font-size: 0.875rem; margin-top: 4px;">${museum.timings || 'Check timings'}</p>
                  </div>
                `)
            )
            .addTo(map.current!);

          markers.current.push(marker);
        }
      }
    });

    // Fit map to show all markers
    if (museums.length > 0 && museums.some(m => m.latitude && m.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      museums.forEach(museum => {
        if (museum.latitude && museum.longitude) {
          const lat = typeof museum.latitude === 'string' ? parseFloat(museum.latitude) : museum.latitude;
          const lng = typeof museum.longitude === 'string' ? parseFloat(museum.longitude) : museum.longitude;
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend([lng, lat]);
          }
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [museums, cityCenter]);

  return (
    <>
      <style>{`
        .museum-marker {
          cursor: pointer;
        }
        .marker-content {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .museum-marker:hover .marker-content {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.6);
        }
        .marker-number {
          color: black;
          font-weight: bold;
          font-size: 16px;
        }
        .marker-popup {
          padding: 4px;
        }
        .mapboxgl-popup-content {
          border-radius: 12px;
          padding: 12px;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-[500px] rounded-2xl shadow-elevated overflow-hidden" />
    </>
  );
};

export default TripPlannerMap;
