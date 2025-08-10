export default function PassportSelector({
  userPassport,
  setUserPassport,
  availableCountries,
}) {
  return (
    <div className="passport-selector">
      <label
        htmlFor="passport-select"
        className="passport-label russo-one-regular"
      >
        Your Passport:
      </label>
      <select
        id="passport-select"
        value={userPassport}
        onChange={(e) => setUserPassport(e.target.value)}
        className="passport-select"
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
