'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { europeGeoJSON } from '@/lib/europeGeoJSON';

interface Territory {
  country: string;
  brands: string[];
}

interface EuropeMapProps {
  territories: Territory[];
  brandCodeToName: Record<string, string>;
}

export default function EuropeMap({ territories, brandCodeToName }: EuropeMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<Territory | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create a map of country names to territory data
  const territoryMap = territories.reduce((acc, territory) => {
    acc[territory.country] = territory;
    return acc;
  }, {} as Record<string, Territory>);


  const onEachFeature = (feature: any, layer: L.Layer) => {
    const countryName = feature.properties.name;
    const territory = territoryMap[countryName];


    if (territory) {
      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const leafletLayer = e.target as L.Path;
          leafletLayer.setStyle({
            fillColor: '#0ea5e9',
            fillOpacity: 0.7,
          });
          setHoveredCountry(territory);
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          const leafletLayer = e.target as L.Path;
          leafletLayer.setStyle({
            fillColor: '#3b82f6',
            fillOpacity: 0.5,
          });
          setHoveredCountry(null);
        },
        mousemove: (e: L.LeafletMouseEvent) => {
          setMousePosition({
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY,
          });
        },
      });
    }
  };

  const geoJSONStyle = (feature: any) => {
    const countryName = feature?.properties?.name;
    const hasTerritory = territoryMap[countryName];

    return {
      fillColor: hasTerritory ? '#3b82f6' : '#d1d5db',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: hasTerritory ? 0.5 : 0.3,
    };
  };

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <MapContainer
        center={[52, 15]}
        zoom={4}
        style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={europeGeoJSON as any}
          style={geoJSONStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Floating brand list on hover */}
      {hoveredCountry && (
        <div
          className="fixed z-[9999] bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-md pointer-events-none"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
          }}
        >
          <h3 className="font-bold text-lg mb-2 text-brand">{hoveredCountry.country}</h3>
          <p className="text-sm text-gray-600 mb-2">Distributed Brands:</p>
          <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
            {hoveredCountry.brands.map((brandCode) => {
              const brandName = brandCodeToName[brandCode] || brandCode;
              return (
                <span
                  key={brandCode}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {brandName}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
