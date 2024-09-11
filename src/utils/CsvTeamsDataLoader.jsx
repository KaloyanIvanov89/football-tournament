import { useState, useEffect } from "react";
import Papa from "papaparse";

export const loadTeamsCsvData = async () => {
  const response = await fetch("/teams.csv");
  const csvData = await response.text();
  const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
  }).data;
  return parsedData;
};

export default function CsvTeamsDataLoader() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parsedData = await loadTeamsCsvData();
      setData(parsedData);
    };
    fetchData();
  }, []);

  return null;
}
