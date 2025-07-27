import Globe from "react-globe.gl";
import { useEffect, useState } from "react";
import CountryCard from "./CountryCard";

function App() {
  const [countries, setCountries] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then(setCountries);
  }, []);

  const countryColorMap = {
    USA: "red",
    EGY: "green",
    FRA: "blue",
  };

  const handleCountryHover = (country) => {
    setHoveredCountry(country);
  };

  const handleCountryUnhover = () => {
    setHoveredCountry(null);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {hoveredCountry && <CountryCard />}

      <Globe
        polygonsData={countries.features}
        polygonAltitude={0.01}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        backgroundImageUrl="/8k_stars_milky_way.jpg"
        atmosphereColor="lightskyblue"
        polygonCapColor={(d) =>
          countryColorMap[d.properties.ISO_A3] || "#00ff00"
        }
        polygonSideColor={() => "#00ff00"}
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
