export default function PassportSelector({
  userPassport,
  setUserPassport,
  availableCountries,
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.8)",
        padding: "12px",
        borderRadius: "8px",
        color: "white",
      }}
    >
      <label
        htmlFor="passport-select"
        className="hind-madurai-regular"
        style={{ marginRight: "8px", fontSize: "14px" }}
      >
        Your Passport:
      </label>
      <select
        id="passport-select"
        value={userPassport}
        onChange={(e) => setUserPassport(e.target.value)}
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          border: "none",
          background: "white",
          color: "black",
        }}
      >
        {availableCountries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
}
