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
  const [isGlobeLoaded, setIsGlobeLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetchGlobeData();

    const initializeData = async () => {
      try {
        const [countryData] = await Promise.all([
          fetchCountriesData(),
          getUserLocation(),
        ]);

        await fetchPassportData(countryData);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error initializing data:", error);
        setIsDataLoaded(true);
      }
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
      setIsGlobeLoaded(true);
    } catch (error) {
      console.error("Error fetching globe data:", error);
      setPolygons({ features: [] });
      setIsGlobeLoaded(true);
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

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false,
          });
        });

        const { latitude, longitude } = position.coords;
        await getCountryFromCoordinates(latitude, longitude);
      } catch (error) {
        console.log("Geolocation failed or not available:", error);
      }
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
    // Show default color while data is loading
    if (!isDataLoaded || !passportMap) {
      return DEFAULT_COLOR;
    }

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
      {isDataLoaded && availableCountries.length > 0 && (
        <PassportSelector
          userPassport={userPassport}
          setUserPassport={setUserLocation}
          availableCountries={availableCountries}
        />
      )}

      {displayedCountry && isDataLoaded && (
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

      {isGlobeLoaded && (
        <Globe
          polygonsData={polygons.features}
          polygonAltitude={0.01}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
          backgroundImageUrl="/8k_stars_milky_way.jpg"
          atmosphereColor="lightskyblue"
          polygonCapColor={(d) => getCountryColor(d)}
          polygonSideColor={(d) => getCountryColor(d)}
          polygonStrokeColor={() => "#000000"}
          polygonsTransitionDuration={300}
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
      )}
    </div>
  );
}

export default App;
