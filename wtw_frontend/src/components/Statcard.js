// Statcard.js (updated)
import React from 'react';

function Statcard({ stats, loading, error }) {
  if (loading) {
    return <div className="stats-container">Loading stats...</div>;
  }

  if (error) {
    return <div className="stats-container">Error: {error}</div>;
  }

  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <div className="stat-card" key={index}>
          <h3 className="stat-title">{stat.title}</h3>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export default Statcard;