import "./App.css";

export default function CountryCard({
  name,
  iso,
  region,
  population,
  capital,
  visaRequirement,
}) {
  const getVisaColor = (requirement) => {
    const colors = {
      "visa free": "#00ff00",
      "visa on arrival": "#ffff00",
      eta: "#ffa500",
      "e-visa": "#ff8c00",
      "visa required": "#ff0000",
      "no admission": "#800000",
      "covid ban": "#4b0000",
    };
    return colors[requirement] || "#cccccc";
  };

  return (
    <div className="country-card">
      <h3>{name}</h3>
      <div className="country-info">
        <p>
          <strong>ISO Code:</strong> {iso}
        </p>
        <p>
          <strong>Visa Requirement:</strong>{" "}
          <span
            style={{
              color: getVisaColor(visaRequirement),
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {visaRequirement}
          </span>
        </p>
        <p>
          <strong>Region:</strong> {region || "Unknown"}
        </p>
        <p>
          <strong>Population:</strong> {population || "N/A"}
        </p>
        <p>
          <strong>Capital:</strong> {capital || "N/A"}
        </p>
      </div>
    </div>
  );
}
