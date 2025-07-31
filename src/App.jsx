import Globe from "react-globe.gl";
import { useEffect, useState } from "react";
import CountryCard from "./CountryCard";
import { VISA_COLORS, DEFAULT_COLOR } from "./constants/visaColors";
import countries from "i18n-iso-countries";
import PassportSelector from "./PassportSelector";

function App() {
  const [polygons, setPolygons] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [userPassport, setUserPassport] = useState("USA");
  const [passportMap, setPassportMap] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);

  useEffect(() => {
    fetchGlobeData();
    fetchPassportData();
    getUserLocation();
  }, []);

  const fetchGlobeData = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
      );
      const data = await response.json();
      setPolygons(data);
    } catch (error) {
      console.error("Error fetching globe data:", error);
    }
  };

  const fetchPassportData = async () => {
    try {
      const response = await fetch("/passport-index-map.json");
      const data = await response.json();
      setPassportMap(data);

      const countryList = Object.keys(data)
        .map((iso3Code) => iso3Code)
        .sort((a, b) => a.localeCompare(b));

      setAvailableCountries(countryList);
    } catch (error) {
      console.error("Error fetching passport data:", error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        getCountryFromCoordinates(latitude, longitude);
      });
    } else {
      console.log("Geolocation is not supported by this browser");
    }
  };

  const getCountryFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();

      if (data.countryCode) {
        const iso3Code = countries.alpha2ToAlpha3(
          data.countryCode.toUpperCase()
        );
        if (iso3Code) {
          setUserPassport(iso3Code);
        }
      }
    } catch (error) {
      console.error("Error getting country from coordinates:", error);
    }
  };

  const getVisaRequirement = (destinationCountryIso) => {
    if (!passportMap || !destinationCountryIso) {
      return "Unknown";
    }

    const userCountryData = passportMap[userPassport];
    if (!userCountryData) {
      return "Unknown";
    }

    return userCountryData[destinationCountryIso] || "Unknown";
  };

  const getVisaColor = (visaRequirement) => {
    return VISA_COLORS[visaRequirement] || DEFAULT_COLOR;
  };

  const getCountryColor = (country) => {
    const visaReq = getVisaRequirement(country.id);
    return getVisaColor(visaReq);
  };

  const handleCountryHover = (country) => {
    setHoveredCountry(country);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <PassportSelector
        userPassport={userPassport}
        setUserPassport={setUserPassport}
        availableCountries={availableCountries}
      />

      {hoveredCountry && (
        <CountryCard
          name={hoveredCountry.properties.name}
          iso={hoveredCountry.id}
          visaRequirement={getVisaRequirement(hoveredCountry.id)}
        />
      )}

      <Globe
        polygonsData={polygons.features}
        polygonAltitude={0.01}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        backgroundImageUrl="/8k_stars_milky_way.jpg"
        atmosphereColor="lightskyblue"
        polygonCapColor={(d) => getCountryColor(d)}
        polygonSideColor={(d) => getCountryColor(d)}
        polygonStrokeColor={() => "#000000"}
        polygonsTransitionDuration={0}
        atmosphereAltitude={0.25}
        enablePointerInteraction={true}
        onPolygonHover={handleCountryHover}
        polygonLabel=""
        rendererConfig={{
          antialias: true,
          alpha: true,
        }}
      />
    </div>
  );
}

export default App;
