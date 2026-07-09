import React from 'react';
import { TreePine, Search, Plus, Filter, Edit, Trash2, Eye, MapPin } from 'lucide-react';

export const TreesView = () => (
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>Tree Management</h1>
        <p>Manage all planted trees, their health status, and assignments.</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="icon-btn" title="Filter"><Filter size={18} /></button>
        <button className="btn-primary"><Plus size={18} /> Register Tree</button>
      </div>
    </div>
    
    <div className="card">
      <div className="search-bar" style={{ width: '100%', marginBottom: '24px', background: 'rgba(0,0,0,0.2)' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search by Tree ID, Species, Assigned Vehicle..." />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Tree ID</th>
            <th>Species</th>
            <th>Assigned To</th>
            <th>Location</th>
            <th>Health Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1,2,3,4,5].map(i => (
            <tr key={i}>
              <td>TR-100{i}</td>
              <td>Neem (Azadirachta indica)</td>
              <td>{i % 2 === 0 ? `VH-00${i}` : `PR-00${i}`}</td>
              <td>Sector {i}, Zone A</td>
              <td>
                <span className="status-badge" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00e676' }}>Healthy</span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={14}/></button>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><MapPin size={14}/></button>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Edit size={14}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
