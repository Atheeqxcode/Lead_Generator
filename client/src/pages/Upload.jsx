// src/pages/Upload.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getAgents = async () => {
      try {
        const data = await fetchWithAuth('/agents');
        setAgents(data);
      } catch (err) {
        setError('Could not fetch agents. Please try again later.');
      }
    };
    getAgents();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Client-side validation for file type
      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError('Invalid file type. Please upload a .csv, .xlsx, or .xls file.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleAgentSelectionChange = (agentId) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (selectedAgents.length === 0) {
      setError('Please select at least one agent to assign leads to.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('agents', JSON.stringify(selectedAgents)); // Add selected agents to form data

    try {
      // Post the FormData. fetchWithAuth will handle the token.
      // DO NOT set 'Content-Type' header manually; the browser does it correctly for FormData.
      const result = await fetchWithAuth('/upload', {
        method: 'POST',
        body: formData,
      });

      setSuccess(result);
      setTimeout(() => navigate('/dashboard'), 5000); // Redirect after 5s
    } catch (err) {
      // Handle specific backend validation errors
      if (err.message.includes('Invalid rows')) {
        // Assuming the error message is a JSON string with details
        try {
          const detailedError = JSON.parse(err.message);
          const errorList = detailedError.invalidRows.map(e => `Row ${e.row}: ${e.error}`).join('; ');
          setError(`Upload failed due to invalid data: ${errorList}`);
        } catch {
          setError(err.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Upload Leads File</h2>
      {!success ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file">Leads File (.csv, .xlsx, .xls)</label>
            <input type="file" id="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
          </div>

          <div className="form-group">
            <label>Assign to Agents</label>
            <div className="agent-checkbox-group">
              {agents.length > 0 ? agents.map(agent => (
                <div key={agent._id} className="agent-checkbox-row">
                  <input
                    type="checkbox"
                    id={`agent-${agent._id}`}
                    value={agent._id}
                    checked={selectedAgents.includes(agent._id)}
                    onChange={() => handleAgentSelectionChange(agent._id)}
                  />
                  <label htmlFor={`agent-${agent._id}`}>{agent.name}</label>
                </div>
              )) : <p>Loading agents...</p>}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading || !file || selectedAgents.length === 0}>
            {loading ? 'Uploading...' : 'Upload and Distribute'}
          </button>
        </form>
      ) : (
        <div className="success-summary">
          <h3>Upload Successful!</h3>
          <p>{success.message}</p>
          <p>Total leads processed: {success.totalRows}</p>
          <p>Successfully assigned: {success.distributedCount}</p>
          <p>Redirecting to dashboard shortly...</p>
          <button onClick={() => navigate('/dashboard')}>View Assignments Now</button>
        </div>
      )}
    </div>
  );
};

export default Upload;
