import React, { useState, useEffect } from 'react';
import typesenseClient from '../lib/typesenseClient';
import Select from 'react-select';

// Helper for react-select grouped options
const groupInsurancePlans = (plans: any[]) => {
  const groups = {};
  plans.forEach((plan) => {
    const group = plan.insurer_name || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push({
      value: plan.plan_name,
      label: plan.plan_name + (plan.aliases?.length ? ` (${plan.aliases.join(', ')})` : ''),
      plan,
    });
  });
  return Object.entries(groups).map(([label, options]) => ({ label, options }));
};

const DEFAULT_INSURANCE_OPTION = {
  value: '',
  label: "I don't know my plan",
};

export default function SearchBar({ onSearch }) {
  // State
  const [procedure, setProcedure] = useState('');
  const [procedureSuggestions, setProcedureSuggestions] = useState([]);
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(DEFAULT_INSURANCE_OPTION);
  const [loadingInsurance, setLoadingInsurance] = useState(false);

  // Fetch insurance plans on mount
  useEffect(() => {
    let mounted = true;
    setLoadingInsurance(true);
    typesenseClient
      .collections('insurance_plans')
      .documents()
      .search({
        q: '*',
        query_by: 'plan_name,insurer_name,aliases',
        per_page: 100,
      })
      .then((res) => {
        if (mounted) {
          const grouped = groupInsurancePlans(res.hits.map((h) => h.document));
          setInsuranceOptions([
            { label: '', options: [DEFAULT_INSURANCE_OPTION] },
            ...grouped,
          ]);
        }
      })
      .catch(() => setInsuranceOptions([{ label: '', options: [DEFAULT_INSURANCE_OPTION] }]))
      .finally(() => setLoadingInsurance(false));
    return () => { mounted = false; };
  }, []);

  // Autocomplete for procedures
  useEffect(() => {
    if (!procedure) return setProcedureSuggestions([]);
    const timeout = setTimeout(() => {
      typesenseClient
        .collections('procedures')
        .documents()
        .search({
          q: procedure,
          query_by: 'name',
          per_page: 5,
        })
        .then((res) => setProcedureSuggestions(res.hits.map((h) => h.document.name)))
        .catch(() => setProcedureSuggestions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [procedure]);

  // Autocomplete for locations
  useEffect(() => {
    if (!location) return setLocationSuggestions([]);
    const timeout = setTimeout(() => {
      typesenseClient
        .collections('locations')
        .documents()
        .search({
          q: location,
          query_by: 'zip,city',
          per_page: 5,
        })
        .then((res) =>
          setLocationSuggestions(
            res.hits.map((h) => `${h.document.city} (${h.document.zip})`)
          )
        )
        .catch(() => setLocationSuggestions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [location]);

  // Handle search button
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        procedure,
        location,
        insurance: selectedInsurance.value,
        selectedInsuranceLabel: selectedInsurance.label,
      });
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row gap-2 md:gap-4 items-center w-full max-w-6xl mx-auto p-0 md:p-2 bg-white rounded-lg shadow border"
    >
      {/* Procedure input */}
      <div className="relative flex-[2.5_2.5_0%] min-w-[350px]">
        <input
          type="text"
          className="w-full h-14 border rounded-lg px-6 py-2 text-xl focus:outline-none focus:ring"
          placeholder="What do you need? (e.g., MRI, blood test)"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          autoComplete="off"
        />
        {procedureSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg shadow max-h-40 overflow-y-auto">
            {procedureSuggestions.map((s, i) => (
              <li
                key={s + i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xl"
                onClick={() => {
                  setProcedure(s);
                  setProcedureSuggestions([]);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Location input */}
      <div className="relative flex-[0.7_0.7_0%] min-w-[130px] max-w-[170px]">
        <input
          type="text"
          className="w-full h-14 border rounded-lg px-4 py-2 text-xl focus:outline-none focus:ring"
          placeholder="ZIP or City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          autoComplete="off"
        />
        {locationSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg shadow max-h-40 overflow-y-auto">
            {locationSuggestions.map((s, i) => (
              <li
                key={s + i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xl"
                onClick={() => {
                  setLocation(s);
                  setLocationSuggestions([]);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Insurance select */}
      <div className="flex-[1.5_1.5_0%] min-w-[220px] max-w-[350px] px-4">
        <Select
          options={insuranceOptions}
          value={selectedInsurance}
          onChange={setSelectedInsurance}
          isLoading={loadingInsurance}
          classNamePrefix="react-select"
          placeholder="Insurance Plan"
          isSearchable
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '3.5rem',
              borderRadius: '0.5rem',
              fontSize: '1.25rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            }),
            menu: (base) => ({ ...base, zIndex: 20 }),
          }}
        />
      </div>
      {/* Search button */}
      <button
        type="submit"
        className="h-14 px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center w-auto min-w-[120px] text-xl shadow"
        aria-label="Search"
      >
        <span className="hidden md:inline">Search</span>
        <svg
          className="w-6 h-6 md:ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
