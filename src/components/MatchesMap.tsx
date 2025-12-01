import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  age: number;
  location: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  bio?: string;
  distance?: number;
  interests?: string[];
  verified?: boolean;
}

interface MatchesMapProps {
  profiles: Profile[];
  userLocation?: { latitude: number; longitude: number };
  onMarkerClick?: (profileId: string) => void;
  onProfileSelect?: (profile: Profile | null) => void;
}

const MatchesMap = ({ profiles, userLocation, onMarkerClick, onProfileSelect }: MatchesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (!token) {
      console.error('Mapbox token not found. Please add VITE_MAPBOX_PUBLIC_TOKEN to your environment variables.');
      return;
    }
    
    mapboxgl.accessToken = token;
    
    // Set initial center to user location or default
    const center: [number, number] = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : [-98.5795, 39.8283]; // Center of US

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Lighter style to match the app's aesthetic
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
      const userMarker = new mapboxgl.Marker({ color: 'hsl(340, 75%, 45%)' }) // Primary magenta color
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          })
            .setHTML('<div class="font-semibold text-[hsl(340,75%,45%)]">Your Location</div>')
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
            // Color ramp for heatmap - using brand colors
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(254,242,242,0)', // transparent blush
              0.2, 'hsl(352, 100%, 90%)', // light blush
              0.4, 'hsl(8, 100%, 85%)', // light coral
              0.6, 'hsl(8, 100%, 75%)', // coral
              0.8, 'hsl(340, 75%, 55%)', // light magenta
              1, 'hsl(340, 75%, 45%)' // primary magenta
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

      // Add markers for each profile with staggered animation
      profiles.forEach((profile, index) => {
      if (!profile.latitude || !profile.longitude) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = profile.photo_url 
        ? `url(${profile.photo_url})`
        : 'linear-gradient(135deg, hsl(340, 75%, 45%) 0%, hsl(8, 100%, 75%) 100%)'; // Brand gradient
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid hsl(340, 75%, 45%)'; // Primary magenta border
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 4px 12px hsla(340, 75%, 45%, 0.3)'; // Branded shadow
      el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Initial state for animation
      el.style.opacity = '0';
      el.style.transform = 'scale(0.5)';
      
      // Trigger animation after a staggered delay
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      }, index * 50); // 50ms delay between each marker
      
      // Hover effect with smooth transitions
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.boxShadow = '0 8px 24px hsla(340, 75%, 45%, 0.4)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 4px 12px hsla(340, 75%, 45%, 0.3)';
        el.style.zIndex = 'auto';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([profile.longitude, profile.latitude])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          })
            .setHTML(`
              <div class="p-3">
                <div class="font-semibold text-base text-[hsl(340,75%,45%)]">${profile.full_name}, ${profile.age}</div>
                <div class="text-sm text-[hsl(340,30%,50%)]">${profile.location}</div>
                ${profile.bio ? `<div class="text-sm mt-1 text-[hsl(340,80%,20%)]">${profile.bio.substring(0, 80)}${profile.bio.length > 80 ? '...' : ''}</div>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);

      if (onMarkerClick) {
        el.addEventListener('click', () => {
          onMarkerClick(profile.id);
          setSelectedProfile(profile);
          onProfileSelect?.(profile);
        });
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
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: hsl(0, 0%, 100%);
          border-radius: 1rem;
          box-shadow: 0 4px 20px -4px hsla(340, 75%, 45%, 0.15);
          border: 1px solid hsl(352, 40%, 88%);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          animation: popupSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mapboxgl-popup-close-button {
          color: hsl(340, 75%, 45%);
          font-size: 20px;
          padding: 8px;
          transition: all 0.2s ease;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: hsl(352, 60%, 92%);
          transform: scale(1.1);
        }
        .mapboxgl-ctrl-group {
          background: hsl(0, 0%, 100%);
          border: 1px solid hsl(352, 40%, 88%);
          box-shadow: 0 4px 20px -4px hsla(340, 75%, 45%, 0.15);
          transition: all 0.2s ease;
        }
        .mapboxgl-ctrl-group button {
          color: hsl(340, 75%, 45%);
          transition: all 0.2s ease;
        }
        .mapboxgl-ctrl-group button:hover {
          background-color: hsl(352, 60%, 92%);
          transform: scale(1.05);
        }
        .marker {
          position: relative;
        }
        .marker::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: hsl(340, 75%, 45%);
          opacity: 0;
          animation: markerPulse 2s ease-in-out infinite;
        }
        @keyframes markerPulse {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.3);
          }
        }
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .dark .mapboxgl-popup-content {
          background: hsl(340, 45%, 12%);
          border-color: hsl(340, 40%, 20%);
        }
        .dark .mapboxgl-ctrl-group {
          background: hsl(340, 45%, 12%);
          border-color: hsl(340, 40%, 20%);
        }
        .dark .mapboxgl-ctrl-group button {
          color: hsl(8, 100%, 75%);
        }
        .dark .mapboxgl-popup-close-button {
          color: hsl(8, 100%, 75%);
        }
      `}</style>
      
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full rounded-lg relative overflow-hidden border border-border">
          {!import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm rounded-lg z-10">
              <div className="text-center p-8 max-w-md">
                <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Map View Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To enable the map view, please add your Mapbox public token to the project settings.
                </p>
                <p className="text-xs text-muted-foreground">
                  Get your token at{" "}
                  <a 
                    href="https://mapbox.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sliding Profile Card */}
        {selectedProfile && (
          <div 
            className="absolute top-0 right-0 h-full w-96 bg-card border-l border-border shadow-soft animate-slide-in-right z-50 overflow-y-auto"
            style={{ maxWidth: '90vw' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedProfile.full_name}, {selectedProfile.age}
                </h2>
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    onProfileSelect?.(null);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedProfile.photo_url && (
                <div className="mb-4 rounded-lg overflow-hidden aspect-square">
                  <img 
                    src={selectedProfile.photo_url} 
                    alt={selectedProfile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Location</h3>
                  <p className="text-foreground">{selectedProfile.location}</p>
                  {selectedProfile.distance && (
                    <p className="text-sm text-muted-foreground">{selectedProfile.distance} miles away</p>
                  )}
                </div>

                {selectedProfile.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">About</h3>
                    <p className="text-foreground">{selectedProfile.bio}</p>
                  </div>
                )}

                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProfile.verified && (
                  <div className="flex items-center gap-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">Verified Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MatchesMap;
