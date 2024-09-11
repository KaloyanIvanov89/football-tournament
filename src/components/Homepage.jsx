import React, { useEffect, useState } from "react";
import {
  SingleEliminationBracket,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { loadMatchesCsvData } from "../utils/CsvMatchesDataLoader";
import { loadTeamsCsvData } from "../utils/CsvTeamsDataLoader";

const DarkTheme = createTheme({
  textColor: { main: "#000000", highlighted: "#F4F2FE", dark: "#707582" },
  matchBackground: { wonColor: "#2D2D59", lostColor: "#1B1D2D" },
  score: {
    background: {
      wonColor: `#10131C`,
      lostColor: "#10131C",
    },
    text: { highlightedWonColor: "#7BF59D", highlightedLostColor: "#FB7E94" },
  },
  border: {
    color: "#292B43",
    highlightedColor: "RGBA(152,82,242,0.4)",
  },
  roundHeader: { backgroundColor: "#3B3F73", fontColor: "#F4F2FE" },
  connectorColor: "#3B3F73",
  connectorColorHighlight: "RGBA(152,82,242,0.4)",
  svgBackground: "#0F121C",
});

const TournamentBracket = () => {
  const [combinedMatches, setCombinedMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const createTeamsMap = (teamsData) => {
    const teamsMap = {};
    teamsData.forEach((team) => {
      if (team.ID) {
        teamsMap[team.ID] = team.Name;
      }
    });
    return teamsMap;
  };

  const linkMatchesWithTeams = (matchesData, teamsMap) => {
    return matchesData.map((match) => {
      const aTeamName =
        teamsMap[match.ATeamID] || `Unknown Team ${match.ATeamID}`;
      const bTeamName =
        teamsMap[match.BTeamID] || `Unknown Team ${match.BTeamID}`;
      const [aTeamScore, bTeamScore] = (match.Score || "0-0")
        .split("-")
        .map(Number);

      // Determine the winner
      const aTeamWinner = aTeamScore > bTeamScore;
      const bTeamWinner = bTeamScore > aTeamScore;

      // Log error if there's a draw
      if (aTeamScore === bTeamScore) {
        console.error(
          `Match ${match.ID} ended in a draw between ${aTeamName} and ${bTeamName}.`
        );
      }

      return {
        id: `Match_${match.ID}`,
        nextMatchId: null, // To be set based on bracket logic
        tournamentRoundText: null, // To be set later
        participants: [
          {
            name: aTeamName,
            resultText: `${aTeamScore}`,
            isWinner: aTeamWinner,
            points: aTeamScore,
          },
          {
            name: bTeamName,
            resultText: `${bTeamScore}`,
            isWinner: bTeamWinner,
            points: bTeamScore,
          },
        ],
      };
    });
  };

  const combineData = (matchesData, teamsData) => {
    const teamsMap = createTeamsMap(teamsData);
    const matches = linkMatchesWithTeams(matchesData, teamsMap);

    // Number of matches per round
    const roundMatches = {
      Round1: matches.slice(0, 8), // 8 pairs = 16 teams
      Round2: [],
      SemiFinal: [],
      Final: [],
    };

    // Set tournament rounds for matches
    roundMatches.Round1.forEach((match) => {
      match.tournamentRoundText = "Round1";
    });

    // Determine winners of Round 1 and set matches for Round 2
    const winnersRound1 = roundMatches.Round1.map((match) => {
      const winner = match.participants.find(
        (participant) => participant.isWinner
      );
      if (!winner) {
        console.error(`Match ${match.id} does not have a winner.`);
        return null;
      }
      return winner;
    }).filter(Boolean);

    // Create Round 2 matches from Round 1 winners
    for (let i = 0; i < winnersRound1.length; i += 2) {
      const match = {
        id: `Match_${roundMatches.Round1.length + i / 2 + 1}`,
        nextMatchId: null, // To be set later
        tournamentRoundText: "Round2",
        participants: [winnersRound1[i], winnersRound1[i + 1]],
      };
      roundMatches.Round2.push(match);
    }

    // Determine winners of Round 2 and set matches for Semi-Final
    const winnersRound2 = roundMatches.Round2.map((match) => {
      const winner = match.participants.find(
        (participant) => participant.isWinner
      );
      if (!winner) {
        console.error(`Match ${match.id} does not have a winner.`);
        return null;
      }
      return winner;
    }).filter(Boolean);

    // Create Semi-Final matches from Round 2 winners
    for (let i = 0; i < winnersRound2.length; i += 2) {
      const match = {
        id: `Match_${
          roundMatches.Round1.length + roundMatches.Round2.length + i / 2 + 1
        }`,
        nextMatchId: null, // To be set later
        tournamentRoundText: "Semi-Final",
        participants: [winnersRound2[i], winnersRound2[i + 1]],
      };
      roundMatches.SemiFinal.push(match);
    }

    // Determine winners of Semi-Final and set match for Final
    const winnersSemiFinal = roundMatches.SemiFinal.map((match) => {
      const winner = match.participants.find(
        (participant) => participant.isWinner
      );
      if (!winner) {
        console.error(`Match ${match.id} does not have a winner.`);
        return null;
      }
      return winner;
    }).filter(Boolean);

    // Create Final match from Semi-Final winners
    const finalMatch = {
      id: `Match_${
        roundMatches.Round1.length +
        roundMatches.Round2.length +
        roundMatches.SemiFinal.length +
        1
      }`,
      nextMatchId: null,
      tournamentRoundText: "Final",
      participants: winnersSemiFinal,
    };
    roundMatches.Final.push(finalMatch);

    // Set nextMatchId for each match
    roundMatches.Round1.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      if (roundMatches.Round2[nextMatchIndex]) {
        match.nextMatchId = roundMatches.Round2[nextMatchIndex].id;
      }
    });

    roundMatches.Round2.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      if (roundMatches.SemiFinal[nextMatchIndex]) {
        match.nextMatchId = roundMatches.SemiFinal[nextMatchIndex].id;
      }
    });

    roundMatches.SemiFinal.forEach((match) => {
      match.nextMatchId = roundMatches.Final[0].id; // Final match
    });

    roundMatches.Final.forEach((match) => {
      match.nextMatchId = null; // No next match
    });

    // Combine all matches into a single array
    return [
      ...roundMatches.Round1,
      ...roundMatches.Round2,
      ...roundMatches.SemiFinal,
      ...roundMatches.Final,
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, teamsData] = await Promise.all([
          loadMatchesCsvData(),
          loadTeamsCsvData(),
        ]);

        const combinedData = combineData(matchesData, teamsData);
        console.log("Combined Matches Data:", combinedData);
        setCombinedMatches(combinedData);
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SingleEliminationBracket
      theme={DarkTheme}
      matches={combinedMatches}
      matchComponent={Match}
      onMatchClick={(match) => console.log(match)}
      onPartyClick={(party) => console.log(party)}
    />
  );
};

export default TournamentBracket;
