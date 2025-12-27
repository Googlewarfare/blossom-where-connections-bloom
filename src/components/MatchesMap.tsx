import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Map, Maximize2, Minimize2, Users, Layers, Filter, X, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { fuzzLocationDeterministic } from '@/lib/location-utils';
import { Label } from '@/components/ui/label';
import { OptimizedImage } from '@/components/OptimizedImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  maxDistanceMiles?: number;
  onMarkerClick?: (profileId: string) => void;
  onProfileSelect?: (profile: Profile | null) => void;
}

const MAP_STYLES = [
  { id: 'light-v11', name: 'Light', icon: '☀️' },
  { id: 'dark-v11', name: 'Dark', icon: '🌙' },
  { id: 'satellite-streets-v12', name: 'Satellite', icon: '🛰️' },
  { id: 'outdoors-v12', name: 'Outdoors', icon: '🏔️' },
];

const MatchesMap = ({ 
  profiles, 
  userLocation, 
  maxDistanceMiles = 50,
  onMarkerClick, 
  onProfileSelect 
}: MatchesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoder = useRef<MapboxGeocoder | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentStyle, setCurrentStyle] = useState('light-v11');
  
  // Filter state
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtered profiles based on filter state
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      if (showVerifiedOnly && !profile.verified) return false;
      if (profile.age < ageRange[0] || profile.age > ageRange[1]) return false;
      return true;
    });
  }, [profiles, showVerifiedOnly, ageRange]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = mapContainer.current?.parentElement;
    if (!container) return;
    
    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Change map style
  const changeMapStyle = (styleId: string) => {
    if (!map.current) return;
    setCurrentStyle(styleId);
    map.current.setStyle(`mapbox://styles/mapbox/${styleId}`);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (!token) {
      console.error('Mapbox token not found.');
      return;
    }
    
    mapboxgl.accessToken = token;
    
    const center: [number, number] = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : [-98.5795, 39.8283];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${currentStyle}`,
      center: center,
      zoom: userLocation ? 10 : 4,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add geocoder search
    geocoder.current = new MapboxGeocoder({
      accessToken: token,
      mapboxgl: mapboxgl as any,
      placeholder: 'Search location...',
      marker: false,
      collapsed: true,
    });
    map.current.addControl(geocoder.current as any, 'top-left');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      updateMapData();
    });

    // Update visible count on move
    map.current.on('moveend', updateVisibleCount);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Re-add data when style changes
  useEffect(() => {
    if (!map.current) return;
    
    map.current.once('style.load', () => {
      updateMapData();
    });
  }, [currentStyle]);

  const updateVisibleCount = () => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    const count = filteredProfiles.filter(p => {
      if (!p.latitude || !p.longitude) return false;
      return bounds.contains([p.longitude, p.latitude]);
    }).length;
    setVisibleCount(count);
  };

  const updateMapData = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Remove existing layers and sources
    ['clusters', 'cluster-count', 'unclustered-point', 'distance-radius', 'heatmap-layer'].forEach(id => {
      if (map.current?.getLayer(id)) map.current.removeLayer(id);
    });
    ['profiles-cluster', 'distance-circle', 'matches-heatmap'].forEach(id => {
      if (map.current?.getSource(id)) map.current.removeSource(id);
    });

    // Add distance radius circle if user location exists
    if (userLocation) {
      const metersPerMile = 1609.34;
      const radiusMeters = maxDistanceMiles * metersPerMile;
      
      // Create a circle using turf-style calculation
      const center = [userLocation.longitude, userLocation.latitude];
      const points = 64;
      const coordinates: [number, number][] = [];
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 360;
        const rad = (angle * Math.PI) / 180;
        const lat = userLocation.latitude + (radiusMeters / 111320) * Math.cos(rad);
        const lng = userLocation.longitude + (radiusMeters / (111320 * Math.cos(userLocation.latitude * Math.PI / 180))) * Math.sin(rad);
        coordinates.push([lng, lat]);
      }
      coordinates.push(coordinates[0]); // Close the circle

      map.current.addSource('distance-circle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      });

      map.current.addLayer({
        id: 'distance-radius',
        type: 'fill',
        source: 'distance-circle',
        paint: {
          'fill-color': 'hsl(340, 75%, 45%)',
          'fill-opacity': 0.1,
          'fill-outline-color': 'hsl(340, 75%, 45%)'
        }
      });

      // Add user location marker
      new mapboxgl.Marker({ color: 'hsl(340, 75%, 45%)' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div class="font-semibold text-primary">Your Location</div>'))
        .addTo(map.current);
    }

    // Create GeoJSON with clustering - using fuzzed coordinates for privacy
    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredProfiles
        .filter(profile => profile.latitude && profile.longitude)
        .map(profile => {
          // Apply deterministic location fuzzing for privacy
          const fuzzed = fuzzLocationDeterministic(
            profile.latitude,
            profile.longitude,
            profile.id,
            0.5 // 0.5 mile fuzzing radius
          );
          return {
            type: 'Feature',
            properties: {
              id: profile.id,
              name: profile.full_name,
              age: profile.age,
              location: profile.location,
              photo_url: profile.photo_url || '',
              bio: profile.bio || '',
              distance: profile.distance || 0,
              verified: profile.verified || false,
              interests: profile.interests?.join(', ') || ''
            },
            geometry: {
              type: 'Point',
              coordinates: [fuzzed.longitude, fuzzed.latitude]
            }
          };
        })
    };

    // Add clustered source
    map.current.addSource('profiles-cluster', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'profiles-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          'hsl(352, 100%, 90%)', // < 10
          10, 'hsl(8, 100%, 75%)', // 10-30
          30, 'hsl(340, 75%, 55%)', // 30-100
          100, 'hsl(340, 75%, 45%)' // 100+
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          30, 40,
          100, 50
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': 'hsl(340, 75%, 45%)'
      }
    });

    // Cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'profiles-cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': 'hsl(340, 75%, 25%)'
      }
    });

    // Individual points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'profiles-cluster',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'verified'],
          'hsl(340, 75%, 45%)',
          'hsl(8, 100%, 75%)'
        ],
        'circle-radius': 12,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Click on cluster to zoom
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties?.cluster_id;
      (map.current!.getSource('profiles-cluster') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          map.current!.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom!
          });
        }
      );
    });

    // Click on point to show profile
    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      
      const props = feature.properties;
      const profile = filteredProfiles.find(p => p.id === props?.id);
      if (profile) {
        setSelectedProfile(profile);
        onProfileSelect?.(profile);
        onMarkerClick?.(profile.id);
      }
    });

    // Popup on hover
    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';
      
      const feature = e.features?.[0];
      if (!feature) return;
      
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      
      new mapboxgl.Popup({ offset: 15, className: 'custom-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div class="p-3">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-base">${props?.name}, ${props?.age}</span>
              ${props?.verified ? '<span class="text-primary">✓</span>' : ''}
            </div>
            <div class="text-sm text-muted-foreground">${props?.location}</div>
            ${props?.distance ? `<div class="text-xs text-muted-foreground">${Math.round(props.distance)} miles away</div>` : ''}
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
      // Remove popups on mouse leave
      const popups = document.getElementsByClassName('mapboxgl-popup');
      while (popups.length > 0) {
        popups[0].remove();
      }
    });

    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    // Fit bounds
    if (filteredProfiles.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }
      filteredProfiles.forEach(profile => {
        if (profile.latitude && profile.longitude) {
          bounds.extend([profile.longitude, profile.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }

    updateVisibleCount();
  };

  // Update when filtered profiles change
  useEffect(() => {
    if (map.current?.isStyleLoaded()) {
      updateMapData();
    }
  }, [filteredProfiles, userLocation, maxDistanceMiles]);

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: 1rem;
          box-shadow: 0 4px 20px -4px hsla(340, 75%, 45%, 0.15);
          border: 1px solid hsl(var(--border));
          font-family: inherit;
          animation: popupSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mapboxgl-popup-close-button {
          color: hsl(var(--primary));
          font-size: 20px;
          padding: 8px;
          transition: all 0.2s ease;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: hsl(var(--muted));
        }
        .mapboxgl-ctrl-group {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 4px 20px -4px hsla(340, 75%, 45%, 0.15);
        }
        .mapboxgl-ctrl-group button {
          color: hsl(var(--primary));
        }
        .mapboxgl-ctrl-group button:hover {
          background-color: hsl(var(--muted));
        }
        .mapboxgl-ctrl-geocoder {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px -4px hsla(340, 75%, 45%, 0.15);
        }
        .mapboxgl-ctrl-geocoder input {
          color: hsl(var(--foreground));
        }
        .mapboxgl-ctrl-geocoder .suggestions {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
        .mapboxgl-ctrl-geocoder .suggestions li a {
          color: hsl(var(--foreground));
        }
        .mapboxgl-ctrl-geocoder .suggestions li a:hover {
          background: hsl(var(--muted));
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
      `}</style>
      
      <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2" style={{ marginTop: '50px' }}>
          {/* Profile Count */}
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 shadow-lg">
            <Users className="w-4 h-4" />
            <span>{visibleCount} profiles in view</span>
          </Badge>
        </div>

        {/* Right side controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2" style={{ marginTop: '100px' }}>
          {/* Fullscreen Toggle */}
          <Button
            size="icon"
            variant="secondary"
            onClick={toggleFullscreen}
            className="shadow-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Map Style Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="shadow-lg">
                <Layers className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MAP_STYLES.map(style => (
                <DropdownMenuItem
                  key={style.id}
                  onClick={() => changeMapStyle(style.id)}
                  className={currentStyle === style.id ? 'bg-muted' : ''}
                >
                  <span className="mr-2">{style.icon}</span>
                  {style.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="secondary" className="shadow-lg relative">
                <Filter className="w-4 h-4" />
                {(showVerifiedOnly || ageRange[0] !== 18 || ageRange[1] !== 80) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowVerifiedOnly(false);
                      setAgeRange([18, 80]);
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verified-only" className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Verified only
                  </Label>
                  <Switch
                    id="verified-only"
                    checked={showVerifiedOnly}
                    onCheckedChange={setShowVerifiedOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age range: {ageRange[0]} - {ageRange[1]}</Label>
                  <Slider
                    value={ageRange}
                    onValueChange={(value) => setAgeRange(value as [number, number])}
                    min={18}
                    max={80}
                    step={1}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Map Container */}
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
            className="absolute top-0 right-0 h-full w-96 bg-card border-l border-border shadow-xl animate-in slide-in-from-right z-50 overflow-y-auto"
            style={{ maxWidth: '90vw' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedProfile.full_name}, {selectedProfile.age}
                  </h2>
                  {selectedProfile.verified && (
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    onProfileSelect?.(null);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close profile"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedProfile.photo_url && (
                <div className="mb-4 rounded-lg overflow-hidden aspect-square">
                  <OptimizedImage 
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
                    <p className="text-sm text-muted-foreground">{Math.round(selectedProfile.distance)} miles away</p>
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
                        <Badge key={idx} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
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
