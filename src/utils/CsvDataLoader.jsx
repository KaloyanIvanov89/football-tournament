import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function CsvDataLoader() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/matches.csv");
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          delimiter: ",",
        }).data;
        setData(parsedData);
      } catch (error) {
        console.error("Error fetching or parsing CSV file:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {data.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ATeamID</th>
              <th>BTeamID</th>
              <th>Date</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.ID}</td>
                <td>{row.ATeamID}</td>
                <td>{row.BTeamID}</td>
                <td>{row.Date}</td>
                <td>{row.Score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}
