import "./App.css";
import { VISA_COLORS, DEFAULT_COLOR } from "./constants/visaColors";

export default function CountryCard({ name, visaRequirement, countryData }) {
  const getVisaColor = (visaRequirement) => {
    if (typeof visaRequirement === "number") return VISA_COLORS["visa free"];

    return VISA_COLORS[visaRequirement] || DEFAULT_COLOR;
  };

  const visaRequirementText = () => {
    if (typeof visaRequirement === "number") {
      return "visa free";
    }
    return visaRequirement || "Unknown";
  };

  const formatPopulation = (population) => {
    if (!population) return "N/A";
    if (population >= 1000000000) {
      return (population / 1000000000).toFixed(1) + "B";
    } else if (population >= 1000000) {
      return (population / 1000000).toFixed(1) + "M";
    } else if (population >= 1000) {
      return (population / 1000).toFixed(1) + "K";
    }
    return population.toLocaleString();
  };

  return (
    <div className="country-card">
      <h3>
        {countryData.flag && (
          <img
            src={countryData.flag}
            alt={`${name} flag`}
            width={24}
            style={{ marginRight: "8px" }}
          />
        )}
        {name}
      </h3>
      <div className="country-info">
        <p>
          <strong>Visa Requirement:</strong>{" "}
          <span
            style={{
              color: getVisaColor(visaRequirement),
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {visaRequirementText()}
          </span>
        </p>
        <p>
          <strong>Language:</strong> {countryData.language || "Unknown"}
        </p>
        <p>
          <strong>Currency:</strong> {countryData.currency || "Unknown"}
        </p>
        <p>
          <strong>Population:</strong>{" "}
          {formatPopulation(countryData.population) || "N/A"}
        </p>
        <p>
          <strong>Capital:</strong> {countryData.capital || "N/A"}
        </p>
      </div>
    </div>
  );
}
