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

    // Clear existing profile markers (keep user marker)
    markers.current.slice(userLocation ? 1 : 0).forEach(marker => marker.remove());
    markers.current = markers.current.slice(0, userLocation ? 1 : 0);

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
  }, [profiles, onMarkerClick]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg" />
  );
};

export default MatchesMap;
