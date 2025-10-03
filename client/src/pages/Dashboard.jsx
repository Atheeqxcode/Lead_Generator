// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../api';

const Dashboard = () => {
  const [agents, setAgents] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch agents and assigned leads concurrently.
      const [agentsData, assignedData] = await Promise.all([
        fetchWithAuth('/agents'),
        fetchWithAuth('/upload'), // The /upload GET endpoint returns all assigned items
      ]);
      setAgents(agentsData);
      setAssigned(assignedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="loading-spinner">Loading Dashboard...</div>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  // Create a map of agent assignments for easy lookup.
  const assignmentsByAgent = assigned.reduce((acc, assignment) => {
    const agentId = assignment.agent._id;
    if (!acc[agentId]) {
      acc[agentId] = {
        agentName: assignment.agent.name,
        items: [],
      };
    }
    acc[agentId].items.push(...assignment.items);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={fetchData}>Refresh Data</button>
          <Link to="/add-agent" className="button-link">Add New Agent</Link>
          <Link to="/upload" className="button-link">Upload Leads</Link>
        </div>
      </header>

      <div className="dashboard-columns">
        {/* Left Column: Agents List */}
        <div className="dashboard-column">
          <h2>Agents ({agents.length})</h2>
          <div className="scrollable-list">
            {agents.length > 0 ? (
              agents.map((agent) => (
                <div key={agent._id} className="list-item agent-item">
                  <strong>{agent.name}</strong>
                  <span>{agent.email}</span>
                  <span>{agent.mobile}</span>
                  <span>
                    Assigned Leads: {assignmentsByAgent[agent._id]?.items.length || 0}
                  </span>
                </div>
              ))
            ) : (
              <p>No agents found. <Link to="/add-agent">Add one now</Link>.</p>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Leads */}
        <div className="dashboard-column">
          <h2>Assigned Leads ({assigned.reduce((sum, a) => sum + a.items.length, 0)})</h2>
          <div className="scrollable-list">
            {Object.keys(assignmentsByAgent).length > 0 ? (
              Object.values(assignmentsByAgent).map(({ agentName, items }) => (
                <div key={agentName} className="list-item assignment-group">
                  <h3>Leads for {agentName}</h3>
                  {items.map((item, index) => (
                    <div key={index} className="assignment-item">
                      {Object.entries(item).map(([key, value]) => {
                        // Skip internal MongoDB fields
                        if (key === '_id' || key === '__v') return null;
                        return (
                          <span key={key}>
                            <strong>{key}:</strong> {value || 'N/A'}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No leads have been assigned yet. <Link to="/upload">Upload a file</Link>.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
