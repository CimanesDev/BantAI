import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Shield, FileText, Users, TrendingUp, AlertTriangle, MapPin, AlertCircle } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Camera } from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from "@/contexts/LanguageContext";

interface LandingHeroProps {
  onSearchClick: () => void;
  onUploadClick: () => void;
}

const cameraLocations = [
  { city: 'Manila', name: 'España cor. Lacson', lat: 14.6091, lng: 120.9902 },
  { city: 'Manila', name: 'Kalaw and M. H. Del Pilar', lat: 14.5742, lng: 120.9832 },
  { city: 'Manila', name: 'Quirino cor. Taft', lat: 14.5701, lng: 120.9882 },
  { city: 'Manila', name: 'España cor. Dela Fuente and Vicente Cruz', lat: 14.6095, lng: 120.9952 },
  { city: 'Manila', name: 'Quirino cor. San Marcelino', lat: 14.5702, lng: 120.9931 },
  { city: 'Manila', name: 'UN Ave. – San Marcelino', lat: 14.5822, lng: 120.9872 },
  { city: 'Manila', name: 'Quirino cor. M.H. Del Pilar', lat: 14.5701, lng: 120.9832 },
  { city: 'Manila', name: 'Abad Santos and Bambang', lat: 14.6272, lng: 120.9742 },
  { city: 'Manila', name: 'Taft cor. P. Ocampo', lat: 14.5612, lng: 120.9952 },
  { city: 'Manila', name: 'Abad Santos and Tayuman', lat: 14.6242, lng: 120.9742 },
  { city: 'Manila', name: 'Burgos cor. Ma. Orosa', lat: 14.5892, lng: 120.9792 },
  { city: 'Manila', name: 'Taft and Estrada', lat: 14.5652, lng: 120.9952 },
  { city: 'Manila', name: 'Chinese Gen, pedestrian', lat: 14.6172, lng: 120.9902 },
  { city: 'Manila', name: 'Taft and Remedios', lat: 14.5702, lng: 120.9872 },
  { city: 'Manila', name: 'Lacson Ave. and Aragon St.', lat: 14.6182, lng: 120.9902 },
  { city: 'Manila', name: 'Taft Pedro Gil', lat: 14.5792, lng: 120.9872 },
  { city: 'Manila', name: 'España Blvd. (Metro Oil)', lat: 14.6091, lng: 120.9902 },
  { city: 'Quezon City', name: 'Kamias – Kalayaan', lat: 14.6372, lng: 121.0472 },
  { city: 'Quezon City', name: 'Quirino Highway – Tandang Sora (Sangandaan)', lat: 14.7032, lng: 121.0472 },
  { city: 'Quezon City', name: '13th Ave – P. Tuazon', lat: 14.6202, lng: 121.0532 },
  { city: 'Quezon City', name: 'Aurora – Gilmore', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: 'Tomas Morato – E. Rodriguez', lat: 14.6262, lng: 121.0332 },
  { city: 'Quezon City', name: 'Aurora – Broadway', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: 'East Ave – BIR Road', lat: 14.6462, lng: 121.0452 },
  { city: 'Quezon City', name: 'Aurora – 20th Street', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: '15th Ave – P. Tuazon', lat: 14.6202, lng: 121.0532 },
  { city: 'Quezon City', name: 'Aurora – Hemady', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: 'Gilmore – E. Rodriguez', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: 'Rodriguez – Hemady', lat: 14.6132, lng: 121.0332 },
  { city: 'Quezon City', name: 'Quirino Highway – Susan Road (Novaliches Bayan)', lat: 14.7302, lng: 121.0472 },
  { city: 'Quezon City', name: 'West Avenue – Baler', lat: 14.6482, lng: 121.0342 },
  { city: 'Quezon City', name: 'Quirino Highway – Zabarte Road', lat: 14.7302, lng: 121.0472 },
  { city: 'Parañaque', name: 'Sto. Niño – Northbound', lat: 14.4892, lng: 121.0262 },
  { city: 'Parañaque', name: 'NAIA Road (Quirino) – Westbound', lat: 14.5212, lng: 121.0002 },
  { city: 'Parañaque', name: "President's Avenue – Northbound", lat: 14.4772, lng: 121.0192 },
  { city: 'Parañaque', name: 'EVACOM CAA Avenue – Northbound', lat: 14.4642, lng: 121.0182 },
  { city: 'Valenzuela', name: 'Fernando St. Northbound, McArthur Highway', lat: 14.7002, lng: 120.9552 },
  { city: 'Valenzuela', name: 'M.H. Del Pilar Blvd. – Southbound', lat: 14.7002, lng: 120.9552 },
  { city: 'Valenzuela', name: 'Gov. Santiago Blvd. – Northbound', lat: 14.7002, lng: 120.9552 },
];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  border: '2px solid #e0e7ef',
};
const center = { lat: 14.5995, lng: 120.9842 };

// Top 20 violations data (scraped from user images)
const topViolations = [
  { offense: "Stalled Vehicle", penalties: ["₱200", "₱200", "₱200"], notes: "" },
  { offense: "No Driver's Uniform", penalties: ["₱100", "₱100", "₱100"], notes: "" },
  { offense: "Failure to Carry/Show/Surrender Driver's License", penalties: ["₱150", "₱150", "₱150"], notes: "" },
  { offense: "Failure to Use Seatbelt (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,000", "₱2,000", "₱5,000 plus one week suspension"], notes: "" },
  { offense: "Loading/Unloading in Prohibited Zone (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,000", "₱1,000", "₱1,000"], notes: "" },
  { offense: "Driving in Slippers", penalties: ["₱100", "₱100", "₱100"], notes: "" },
  { offense: "Defective Motor Vehicle Accessories (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,000", "₱1,000", "₱1,000"], notes: "" },
  { offense: "No Crash Helmet (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,500", "₱3,000", "₱5,000 (4th offense ₱10,000 with confiscation)"], notes: "" },
  { offense: "Reckless Driving (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,000", "₱1,000 with seminar", "₱2,000 with seminar"], notes: "" },
  { offense: "Tricycle Ban (The Metro Manila Traffic Code of 2023)", penalties: ["₱500", "₱500", "₱500"], notes: "" },
  { offense: "Truck Lane", penalties: ["₱2,000", "₱2,000", "₱2,000"], notes: "" },
  { offense: "Storage Fee", penalties: ["₱80/DAY", "₱80/DAY", "₱80/DAY"], notes: "" },
  { offense: "Illegal Turning", penalties: ["₱150", "₱150", "₱150"], notes: "" },
  { offense: "Unattended Illegal-Parked (Reg. no. 18-008 Series of 2018 1/7/2019)", penalties: ["₱2,000 WITH IMPOUNDMENT", "₱2,000 WITH IMPOUNDMENT", "₱2,000 WITH IMPOUNDMENT"], notes: "" },
  { offense: "Disregarding Traffic Signs (The Metro Manila Traffic Code of 2023)", penalties: ["₱1,000", "₱1,000", "₱1,000"], notes: "" },
  { offense: "Unified Vehicle Volume Reduction Program (The Metro Manila Traffic Code as 2023)", penalties: ["₱500", "₱500", "₱500"], notes: "" },
  { offense: "Attended Illegal-Parked (Reg. no. 18-008 Series of 2018 1/7/2019)", penalties: ["₱1,000", "₱1,000", "₱1,000"], notes: "" },
  { offense: "Dress Code for Riders (for Motorcycles) (The Metro Manila Traffic Code of 2023)", penalties: ["₱500", "₱750", "₱1,000"], notes: "" },
  { offense: "Obstruction - MMDA Reg. No. 18-008 Series of 2018 (as of January 7, 2019)", penalties: ["₱1,000", "₱1,000", "₱1,000"], notes: "" },
  { offense: "Failure to Give Proper Signal", penalties: ["₱150", "₱150", "₱150"], notes: "" },
];

export const LandingHero = ({ onSearchClick, onUploadClick }: LandingHeroProps) => {
  const { t } = useLanguage();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const cameraIcon = isLoaded && window.google ? {
    url: 'data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="%23007bff"/><path d="M28 15.5V25.5C28 26.3284 27.3284 27 26.5 27H13.5C12.6716 27 12 26.3284 12 25.5V15.5C12 14.6716 12.6716 14 13.5 14H15L16.5 12H23.5L25 14H26.5C27.3284 14 28 14.6716 28 15.5Z" stroke="white" stroke-width="2"/><circle cx="20" cy="20.5" r="3.5" stroke="white" stroke-width="2"/></svg>',
    scaledSize: new window.google.maps.Size(40, 40),
  } : undefined;

  // Pagination for Top 20 Violations
  const [page, setPage] = useState(0);
  const pageSize = 7;
  const totalPages = Math.ceil(topViolations.length / pageSize);
  const paginatedViolations = topViolations.slice(page * pageSize, (page + 1) * pageSize);
  // Helper to split penalty and note
  function splitPenalty(penalty: string) {
    const noteMatch = penalty.match(/(plus one week suspension|4th offense.*|with seminar|WITH IMPOUNDMENT)/i);
    if (noteMatch) {
      const [note] = noteMatch;
      const main = penalty.replace(note, '').trim();
      return { main, note };
    }
    return { main: penalty, note: '' };
  }

  // Group camera locations by city
  const groupedLocations = cameraLocations.reduce((acc, loc) => {
    acc[loc.city] = acc[loc.city] || [];
    acc[loc.city].push(loc);
    return acc;
  }, {} as Record<string, typeof cameraLocations>);

  const outerHeroRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [outerWidth, setOuterWidth] = useState(0);
  const jeepWidth = 80;

  useEffect(() => {
    if (outerHeroRef.current) {
      setOuterWidth(outerHeroRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (outerHeroRef.current) setOuterWidth(outerHeroRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="space-y-16">
        {/* HERO SECTION */}
        <motion.div ref={outerHeroRef} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }} className="relative text-center py-20 bg-card/80 backdrop-blur-lg border border-primary/10 rounded-3xl shadow-md overflow-hidden">
          {/* Visual blue and red circles background */}
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#0d3b86]/40 blur-3xl z-0" style={{ filter: 'blur(60px)' }} />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#b61c24]/40 blur-3xl z-0" style={{ filter: 'blur(60px)' }} />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            {/* Replace BantAI text with logo */}
            <img src="/images/bantai.png" alt="BantAI Logo" className="mx-auto h-36 w-auto mb-6" />
            <p className="text-xl text-primary mb-10 leading-relaxed max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onSearchClick} 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="h-5 w-5 mr-2" />
                {t('searchPlateNumber')}
              </Button>
              <Button 
                onClick={onUploadClick} 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t('uploadTicketToAppeal')}
              </Button>
            </div>
          </div>
          {/* Animated Jeep - bounce within outer hero section, flip on edge, smaller size */}
          <div className="relative w-full flex items-center justify-center select-none overflow-x-hidden mt-10" style={{ height: '64px' }}>
            <motion.img
              src="/images/jeep.png"
              alt="Jeepney"
              className="h-16 drop-shadow-xl"
              draggable="false"
              animate={{ x: direction === 'right' ? (outerWidth - jeepWidth) / 2 : -(outerWidth - jeepWidth) / 2 }}
              transition={{ x: { duration: 5, ease: 'linear' } }}
              style={{ transform: direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)' }}
              onAnimationComplete={() => setDirection(d => (d === 'right' ? 'left' : 'right'))}
            />
          </div>
        </motion.div>

        {/* MAP + CAMERA LOCATIONS SIDE-BY-SIDE */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }} className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Map Section */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, type: 'spring' }} className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
                <div className="relative flex items-center justify-center" style={{ minHeight: 480, height: 480 }}>
              {!isLoaded ? (
                    <div className="flex flex-col items-center justify-center w-full h-full min-h-[480px]">
                      <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                  <span className="text-blue-600 font-medium">Loading map...</span>
                </div>
              ) : (
                <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '2px solid #e0e7ef' }}
                  center={center}
                  zoom={11}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                        styles: [
                          {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                          }
                        ]
                  }}
                >
                  {cameraLocations.map((camera, idx) => (
                    <Marker
                      key={idx}
                      position={{ lat: camera.lat, lng: camera.lng }}
                      title={camera.name}
                      icon={cameraIcon}
                    />
                  ))}
                </GoogleMap>
              )}
            </div>
            {/* Legend */}
                <div className="flex items-center justify-center mt-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                  <Camera className="h-4 w-4 text-white" />
                </span>
                    <span className="text-blue-700 font-medium">Camera Location</span>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Camera Locations List Section */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, type: 'spring' }} className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow border border-blue-100 p-4 h-full flex flex-col">
                <h3 className="text-lg font-bold text-blue-900 mb-3 text-center">All BantAI Camera Locations</h3>
                <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {Object.entries(groupedLocations).map(([city, locations]) => (
                    <div key={city} className="mb-1">
                      <div className="font-semibold text-blue-700 mb-1 flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        {city}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {locations.map((loc, idx) => (
                          <span
                            key={loc.name + idx}
                            className="flex items-center gap-1 text-blue-900 text-xs bg-blue-50 rounded px-2 py-0.5 border border-blue-100"
                          >
                            {loc.name}
                          </span>
                        ))}
            </div>
          </div>
                  ))}
        </div>
      </div>
            </motion.div>
          </div>
        </motion.div>

        {/* WHY CHOOSE BANTAI */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }} className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Why Choose BantAI?</h2>
            <p className="text-lg text-primary">Comprehensive tools to help you manage and appeal traffic violations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/10 bg-card/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">Quick Search</CardTitle>
                <CardDescription className="text-primary">
                  Instantly check violations by plate number without creating an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-primary space-y-2">
                  <li>• Real-time violation lookup</li>
                  <li>• Multiple vehicle search</li>
                  <li>• Detailed violation history</li>
                  <li>• Fine amount calculations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-destructive/10 bg-card/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="bg-destructive/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-xl text-destructive">AI Analysis</CardTitle>
                <CardDescription className="text-destructive">
                  Upload tickets for intelligent analysis and automated appeal generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-destructive space-y-2">
                  <li>• Smart ticket analysis</li>
                  <li>• Legal compliance check</li>
                  <li>• Professional appeal letters</li>
                  <li>• Success rate optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">Account Benefits</CardTitle>
                <CardDescription className="text-primary">
                  Sign up to save vehicles, track appeals, and access premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-primary space-y-2">
                  <li>• Save multiple vehicles</li>
                  <li>• Appeal tracking</li>
                  <li>• Violation analytics</li>
                  <li>• Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* TOP 20 TRAFFIC VIOLATIONS AND PENALTIES */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, type: 'spring' }} className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-primary mb-4">Top 20 Traffic Violations and Penalties</h2>
            <p className="text-lg text-primary">Based on MMDA (2025). Know the penalties for the most common violations.</p>
        </div>
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-card/80 backdrop-blur-lg border border-primary/10">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-primary/10 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-primary font-semibold text-base">Offense</th>
                  <th className="px-6 py-4 text-primary font-semibold text-base text-center"><AlertCircle className="inline-block mr-1 text-primary" size={18}/>1st</th>
                  <th className="px-6 py-4 text-primary font-semibold text-base text-center"><AlertCircle className="inline-block mr-1 text-primary" size={18}/>2nd</th>
                  <th className="px-6 py-4 text-primary font-semibold text-base text-center"><AlertCircle className="inline-block mr-1 text-primary" size={18}/>3rd</th>
                </tr>
              </thead>
              <tbody>
                {paginatedViolations.map((v, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50/50"}>
                    <td className="px-6 py-4 border-b border-blue-100 text-blue-900 font-medium max-w-xs whitespace-pre-line align-top">{v.offense}</td>
                    {[0,1,2].map(idx => {
                      const { main, note } = splitPenalty(v.penalties[idx]);
                      return (
                        <td key={idx} className="px-6 py-4 border-b border-blue-100 text-center align-top">
                          <span>{main}</span>
                          {note && <div className="text-xs text-blue-500 mt-1 whitespace-pre-line">{note}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                className={`px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition ${page === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="text-blue-900 font-medium">Page {page + 1} of {totalPages}</span>
              <button
                className={`px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                Next
              </button>
            </div>
        </div>
        </motion.div>
      </div>
    </>
  );
};
