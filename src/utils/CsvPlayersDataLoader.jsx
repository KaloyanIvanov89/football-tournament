import { useState, useEffect } from "react";
import Papa from "papaparse";

export const loadPlayersCsvData = async () => {
  const response = await fetch("/players.csv");
  const csvData = await response.text();
  const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
  }).data;
  return parsedData;
};

export default function CsvPlayersDataLoader() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parsedData = await loadPlayersCsvData();
      setData(parsedData);
    };
    fetchData();
  }, []);

  return null;
}
