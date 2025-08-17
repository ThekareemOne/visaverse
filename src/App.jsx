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
  const [userCity, setUserCity] = useState("New York");
  const [passportMap, setPassportMap] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [countryDataMap, setCountryDataMap] = useState({});
  const [clickedCountry, setClickedCountry] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      fetchGlobeData();
      const countryData = await fetchCountriesData();
      fetchPassportData(countryData);
      getUserLocation();
    };

    initializeData();
  }, []);

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      if (hoveredCountry) {
        canvas.classList.add("pin-cursor");
      } else {
        canvas.classList.remove("pin-cursor");
      }
    }
  }, [hoveredCountry]);

  const fetchCountriesData = async () => {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca3,currencies,flags,population,languages,capital"
      );
      const data = await response.json();
      const countryMap = data.reduce((acc, country) => {
        acc[country.cca3] = {
          name: country.name.common,
          population: country.population,
          capital: country.capital ? country.capital[0] : "N/A",
          currency: country.currencies
            ? Object.keys(country.currencies)[0]
            : "N/A",
          language: country.languages
            ? Object.values(country.languages)[0]
            : "N/A",
          flag: country.flags ? country.flags.svg : null,
        };
        return acc;
      }, {});
      setCountryDataMap(countryMap);
      return countryMap;
    } catch (error) {
      console.error("Error fetching countries data:", error);
      return {};
    }
  };

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

  const fetchPassportData = async (countryData) => {
    try {
      const response = await fetch("/passport-index-map.json");
      const data = await response.json();
      setPassportMap(data);

      const countryList = Object.keys(data)
        .map((iso3Code) => {
          const country = countryData[iso3Code];
          return {
            name: country ? country.name : iso3Code,
            value: iso3Code,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

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

  const setUserLocation = (userPassport) => {
    setUserPassport(userPassport);
    const countryData = countryDataMap[userPassport];
    if (countryData && countryData.capital) setUserCity(countryData.capital);
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
          setUserCity(data.city);
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

    if (typeof visaReq === "number") return getVisaColor("visa free");
    return getVisaColor(visaReq);
  };

  const handleCountryHover = (country) => {
    // Disable hover on touch devices (mobiles and tablets)
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }
    setHoveredCountry(country);
  };

  const handleCountryUnhover = () => {
    // Disable hover on touch devices (mobiles and tablets)
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }
    setHoveredCountry(null);
  };

  const handleCountryClick = (country, event) => {
    event.stopPropagation();
    setClickedCountry(country);
  };

  const displayedCountry = clickedCountry || hoveredCountry;

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
      }}
    >
      <PassportSelector
        userPassport={userPassport}
        setUserPassport={setUserLocation}
        availableCountries={availableCountries}
      />

      {displayedCountry && (
        <CountryCard
          name={displayedCountry.properties.name}
          iso={displayedCountry.id}
          visaRequirement={getVisaRequirement(displayedCountry.id)}
          countryData={countryDataMap[displayedCountry.id] || {}}
          userCity={userCity}
          onClose={() => {
            setClickedCountry(null);
            setHoveredCountry(null);
          }}
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
        onPolygonUnhover={handleCountryUnhover}
        onPolygonClick={handleCountryClick}
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
