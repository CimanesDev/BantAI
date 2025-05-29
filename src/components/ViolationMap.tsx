import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Camera, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

// All NCAP camera locations (grouped by city)
const cameraLocations = [
  // Manila
  { city: 'Manila', name: 'España cor. Lacson', lat: 14.6091, lng: 120.9902, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6091,120.9902&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Kalaw and M. H. Del Pilar', lat: 14.5742, lng: 120.9832, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5742,120.9832&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Quirino cor. Taft', lat: 14.5701, lng: 120.9882, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5701,120.9882&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'España cor. Dela Fuente and Vicente Cruz', lat: 14.6095, lng: 120.9952, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6095,120.9952&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Quirino cor. San Marcelino', lat: 14.5702, lng: 120.9931, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5702,120.9931&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'UN Ave. – San Marcelino', lat: 14.5822, lng: 120.9872, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5822,120.9872&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Quirino cor. M.H. Del Pilar', lat: 14.5701, lng: 120.9832, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5701,120.9832&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Abad Santos and Bambang', lat: 14.6272, lng: 120.9742, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6272,120.9742&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Taft cor. P. Ocampo', lat: 14.5612, lng: 120.9952, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5612,120.9952&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Abad Santos and Tayuman', lat: 14.6242, lng: 120.9742, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6242,120.9742&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Burgos cor. Ma. Orosa', lat: 14.5892, lng: 120.9792, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5892,120.9792&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Taft and Estrada', lat: 14.5652, lng: 120.9952, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5652,120.9952&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Chinese Gen, pedestrian', lat: 14.6172, lng: 120.9902, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6172,120.9902&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Taft and Remedios', lat: 14.5702, lng: 120.9872, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5702,120.9872&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Lacson Ave. and Aragon St.', lat: 14.6182, lng: 120.9902, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6182,120.9902&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'Taft Pedro Gil', lat: 14.5792, lng: 120.9872, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5792,120.9872&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Manila', name: 'España Blvd. (Metro Oil)', lat: 14.6091, lng: 120.9902, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6091,120.9902&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  // Quezon City
  { city: 'Quezon City', name: 'Kamias – Kalayaan', lat: 14.6372, lng: 121.0472, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6372,121.0472&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Quirino Highway – Tandang Sora (Sangandaan)', lat: 14.7032, lng: 121.0472, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7032,121.0472&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: '13th Ave – P. Tuazon', lat: 14.6202, lng: 121.0532, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6202,121.0532&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Aurora – Gilmore', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Tomas Morato – E. Rodriguez', lat: 14.6262, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6262,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Aurora – Broadway', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'East Ave – BIR Road', lat: 14.6462, lng: 121.0452, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6462,121.0452&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Aurora – 20th Street', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: '15th Ave – P. Tuazon', lat: 14.6202, lng: 121.0532, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6202,121.0532&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Aurora – Hemady', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Gilmore – E. Rodriguez', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Rodriguez – Hemady', lat: 14.6132, lng: 121.0332, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6132,121.0332&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Quirino Highway – Susan Road (Novaliches Bayan)', lat: 14.7302, lng: 121.0472, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7302,121.0472&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'West Avenue – Baler', lat: 14.6482, lng: 121.0342, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.6482,121.0342&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Quezon City', name: 'Quirino Highway – Zabarte Road', lat: 14.7302, lng: 121.0472, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7302,121.0472&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  // Parañaque
  { city: 'Parañaque', name: 'Sto. Niño – Northbound', lat: 14.4892, lng: 121.0262, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.4892,121.0262&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Parañaque', name: 'NAIA Road (Quirino) – Westbound', lat: 14.5212, lng: 121.0002, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.5212,121.0002&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Parañaque', name: "President's Avenue – Northbound", lat: 14.4772, lng: 121.0192, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.4772,121.0192&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Parañaque', name: 'EVACOM CAA Avenue – Northbound', lat: 14.4642, lng: 121.0182, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.4642,121.0182&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  // Valenzuela
  { city: 'Valenzuela', name: 'Fernando St. Northbound, McArthur Highway', lat: 14.7002, lng: 120.9552, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7002,120.9552&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Valenzuela', name: 'M.H. Del Pilar Blvd. – Southbound', lat: 14.7002, lng: 120.9552, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7002,120.9552&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
  { city: 'Valenzuela', name: 'Gov. Santiago Blvd. – Northbound', lat: 14.7002, lng: 120.9552, image: 'https://maps.googleapis.com/maps/api/streetview?size=300x200&location=14.7002,120.9552&fov=90&heading=0&pitch=0&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
];

interface ViolationMapProps {
  violations: { 
    lat: number; 
    lng: number; 
    location: string; 
    plate: string; 
    date?: string;
    coordinates?: { lat: number; lng: number };
    [key: string]: any 
  }[];
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  border: '2px solid #e0e7ef',
};

const center = { lat: 14.5995, lng: 120.9842 }; // Metro Manila

export const ViolationMap = ({ violations }: ViolationMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<number | null>(null);
  const [showAllCameras, setShowAllCameras] = useState(false);
  const [markerFilter, setMarkerFilter] = useState<'all' | 'cameras' | 'violations'>('all');
  const [hoveredCamera, setHoveredCamera] = useState<number | null>(null);

  // Filter out violations without coordinates
  const validViolations = violations.filter(v => 
    (v.coordinates?.lat && v.coordinates?.lng) || (v.lat && v.lng)
  ).map(v => ({
    ...v,
    lat: v.coordinates?.lat ?? v.lat ?? 0,
    lng: v.coordinates?.lng ?? v.lng ?? 0
  }));

  // Only create icon objects after map is loaded
  const cameraIcon = isLoaded && window.google ? {
    url: 'data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="%23007bff"/><path d="M28 15.5V25.5C28 26.3284 27.3284 27 26.5 27H13.5C12.6716 27 12 26.3284 12 25.5V15.5C12 14.6716 12.6716 14 13.5 14H15L16.5 12H23.5L25 14H26.5C27.3284 14 28 14.6716 28 15.5Z" stroke="white" stroke-width="2"/><circle cx="20" cy="20.5" r="3.5" stroke="white" stroke-width="2"/></svg>',
    scaledSize: new window.google.maps.Size(40, 40),
  } : undefined;
  const violationIcon = isLoaded && window.google ? {
    url: 'data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="%23ff3b3b"/><path d="M20 12V22" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="27" r="1.5" fill="white"/></svg>',
    scaledSize: new window.google.maps.Size(40, 40),
  } : undefined;

  // Camera Locations collapse logic
  const cameraList = showAllCameras ? cameraLocations : cameraLocations.slice(0, 5);

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Violation Map</CardTitle>
        <CardDescription className="text-destructive">
          View your violations on the map
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                  <Camera className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-700 font-medium">Camera</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </span>
                <span className="text-red-700 font-medium">Violation</span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center" style={{ minHeight: 400 }}>
            {!isLoaded ? (
              <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
                <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span className="text-blue-600 font-medium">Loading map...</span>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={11}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {(markerFilter === 'all' || markerFilter === 'cameras') && cameraLocations.map((camera, idx) => (
                  <Marker
                    key={idx}
                    position={{ lat: camera.lat, lng: camera.lng }}
                    title={camera.name}
                    icon={cameraIcon}
                    onClick={() => { setSelectedCamera(idx); setSelectedViolation(null); }}
                    onMouseOver={() => setHoveredCamera(idx)}
                    onMouseOut={() => setHoveredCamera(null)}
                  />
                ))}
                {(markerFilter === 'all' || markerFilter === 'violations') && validViolations.map((violation, idx) => (
                  <Marker
                    key={`violation-${idx}`}
                    position={{ lat: violation.lat, lng: violation.lng }}
                    title={violation.location}
                    icon={violationIcon}
                    onClick={() => { setSelectedViolation(idx); setSelectedCamera(null); }}
                  />
                ))}
                {hoveredCamera !== null && (
                  <InfoWindow
                    position={{
                      lat: cameraLocations[hoveredCamera].lat,
                      lng: cameraLocations[hoveredCamera].lng,
                    }}
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -40),
                      disableAutoPan: true,
                    }}
                  >
                    <div className="p-2 min-w-[300px]">
                      <div className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                        <Camera className="h-4 w-4 text-blue-500" />
                        {cameraLocations[hoveredCamera].name}
                      </div>
                      <div className="text-xs text-gray-700 mb-2">{cameraLocations[hoveredCamera].city}</div>
                      <img 
                        src={cameraLocations[hoveredCamera].image} 
                        alt={cameraLocations[hoveredCamera].name}
                        className="w-full h-[200px] object-cover rounded-lg"
                      />
                    </div>
                  </InfoWindow>
                )}
                {selectedCamera !== null && (
                  <InfoWindow
                    position={{
                      lat: cameraLocations[selectedCamera].lat,
                      lng: cameraLocations[selectedCamera].lng,
                    }}
                    onCloseClick={() => setSelectedCamera(null)}
                  >
                    <div className="p-2 min-w-[180px]">
                      <div className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                        <Camera className="h-4 w-4 text-blue-500" />
                        {cameraLocations[selectedCamera].name}
                      </div>
                      <div className="text-xs text-gray-700 mb-1">{cameraLocations[selectedCamera].city}</div>
                    </div>
                  </InfoWindow>
                )}
                {selectedViolation !== null && violations[selectedViolation] && (
                  <InfoWindow
                    position={{
                      lat: violations[selectedViolation].lat,
                      lng: violations[selectedViolation].lng,
                    }}
                    onCloseClick={() => setSelectedViolation(null)}
                  >
                    <div className="p-2 min-w-[180px]">
                      <div className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Violation Location
                      </div>
                      <div className="text-xs text-gray-700 mb-1">{violations[selectedViolation].location}</div>
                      <div className="text-xs text-gray-500">Plate: <span className="font-bold text-red-600">{violations[selectedViolation].plate}</span></div>
                      {violations[selectedViolation].date && (
                        <div className="text-xs text-gray-400">Date: {violations[selectedViolation].date}</div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
