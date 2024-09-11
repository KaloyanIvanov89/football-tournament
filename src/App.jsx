import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import MatchDetails from "./components/MatchDetails";
import TeamDetails from "./components/TeamDetails";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/match-details" element={<MatchDetails />} />
        <Route path="/team-details" element={<TeamDetails />} />
      </Routes>
    </>
  );
}

export default App;
