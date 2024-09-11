import React, { useState, useEffect } from "react";
import { loadPlayersCsvData } from "../utils/CsvPlayersDataLoader";
import { loadTeamsCsvData } from "../utils/CsvTeamsDataLoader";
import "../styles/roosterView.css";

const RosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamsAndPlayers = async () => {
      try {
        const [teamsData, playersData] = await Promise.all([
          loadTeamsCsvData(),
          loadPlayersCsvData(),
        ]);

        const teamsMap = teamsData.reduce((acc, team) => {
          acc[team.ID] = { ...team, Members: [] };
          return acc;
        }, {});

        playersData.forEach((player) => {
          const team = teamsMap[player.TeamID];
          if (player.TeamID && team) {
            team.Members.push({
              name: player.FullName,
              position: player.Position,
              number: player.TeamNumber,
            });
          } else {
            console.error(
              `No team found for player with TeamID: ${player.TeamID}`
            );
          }
        });

        const filteredTeams = Object.values(teamsMap).filter(
          (team) => team.ID <= 24
        );
        setTeams(filteredTeams);
      } catch (error) {
        console.error("Error loading teams or players data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsAndPlayers();
  }, []);

  if (loading) {
    return <div>Loading teams data...</div>;
  }

  return (
    <div className="container">
      {teams.map((team) => (
        <div key={team.ID} className="team-container">
          <div className="team-header">
            <p>Country: {team.Name}</p>
            <p>Manager: {team.ManagerFullName}</p>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Player Name</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {team.Members.length > 0 ? (
                  team.Members.map((member, index) => (
                    <tr key={index}>
                      <td>{member.number}</td>
                      <td>{member.name}</td>
                      <td>{member.position}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-message">
                      No players available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RosterView;
