import "../styles/header.css";

export default function Header() {
  return (
    <div>
      <header className="header">
        <ul>
          <li>
            <a href="/">Home</a>
            <a href="/match-details">Match Details</a>
            <a href="/team-details">Team Details</a>
          </li>
        </ul>
      </header>
    </div>
  );
}
