import "./App.css";

export default function CountryCard({
  name,
  iso,
  region,
  population,
  capital,
}) {
  return (
    <div className="country-card">
      <h3>{name}</h3>
      <div className="country-info">
        <p>
          <strong>ISO Code:</strong> {iso}
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
