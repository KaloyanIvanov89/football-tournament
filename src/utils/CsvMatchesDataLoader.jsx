import { useState, useEffect } from "react";
import Papa from "papaparse";

export const loadMatchesCsvData = async () => {
  const response = await fetch("/matches.csv");
  const csvData = await response.text();
  const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
  }).data;
  return parsedData;
};

export default function CsvMatchesDataLoader() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parsedData = await loadMatchesCsvData();
      setData(parsedData);
    };
    fetchData();
  }, []);

  return null;
}
