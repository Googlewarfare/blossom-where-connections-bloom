import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Profile {
  id: string;
  full_name: string;
  age: number;
  location: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  bio?: string;
}

interface MatchesMapProps {
  profiles: Profile[];
  userLocation?: { latitude: number; longitude: number };
  onMarkerClick?: (profileId: string) => void;
}

const MatchesMap = ({ profiles, userLocation, onMarkerClick }: MatchesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }
    
    mapboxgl.accessToken = token;
    
    // Set initial center to user location or default
    const center: [number, number] = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : [-98.5795, 39.8283]; // Center of US

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: userLocation ? 10 : 4,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div class="font-semibold">Your Location</div>')
        )
        .addTo(map.current);
      
      markers.current.push(userMarker);
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  // Update markers when profiles change
  useEffect(() => {
    if (!map.current) return;

    // Wait for map to be fully loaded
    if (!map.current.isStyleLoaded()) {
      map.current.once('load', () => {
        updateMapData();
      });
    } else {
      updateMapData();
    }

    function updateMapData() {
      if (!map.current) return;

      // Clear existing profile markers (keep user marker)
      markers.current.slice(userLocation ? 1 : 0).forEach(marker => marker.remove());
      markers.current = markers.current.slice(0, userLocation ? 1 : 0);

      // Create GeoJSON data for heatmap
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: profiles
          .filter(profile => profile.latitude && profile.longitude)
          .map(profile => ({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Point' as const,
              coordinates: [profile.longitude, profile.latitude]
            }
          }))
      };

      // Add or update heatmap source
      if (map.current.getSource('matches-heatmap')) {
        (map.current.getSource('matches-heatmap') as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.current.addSource('matches-heatmap', {
          type: 'geojson',
          data: geojsonData
        });

        // Add heatmap layer
        map.current.addLayer({
          id: 'matches-heatmap-layer',
          type: 'heatmap',
          source: 'matches-heatmap',
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': 1,
            // Increase the heatmap color weight by zoom level
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              12, 3
            ],
            // Color ramp for heatmap
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(236,222,239,0)',
              0.2, 'rgb(208,209,230)',
              0.4, 'rgb(166,189,219)',
              0.6, 'rgb(103,169,207)',
              0.8, 'rgb(28,144,153)',
              1, 'rgb(1,108,89)'
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              12, 20
            ],
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 1,
              12, 0.5
            ]
          }
        });
      }

      // Add markers for each profile
      profiles.forEach(profile => {
      if (!profile.latitude || !profile.longitude) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = profile.photo_url 
        ? `url(${profile.photo_url})`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([profile.longitude, profile.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold text-base">${profile.full_name}, ${profile.age}</div>
                <div class="text-sm text-muted-foreground">${profile.location}</div>
                ${profile.bio ? `<div class="text-sm mt-1">${profile.bio.substring(0, 80)}${profile.bio.length > 80 ? '...' : ''}</div>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(profile.id));
      }

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (profiles.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }
      
      profiles.forEach(profile => {
        if (profile.latitude && profile.longitude) {
          bounds.extend([profile.longitude, profile.latitude]);
        }
      });

      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
    }
  }, [profiles, onMarkerClick, userLocation]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg" />
  );
};

export default MatchesMap;
