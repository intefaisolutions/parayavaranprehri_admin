import React from 'react';
import { Users, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';

export const PersonsView = () => (
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>Person Management</h1>
        <p>Master record of every citizen registered on the platform.</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="icon-btn" title="Filter"><Filter size={18} /></button>
        <button className="btn-primary"><Plus size={18} /> Add Person</button>
      </div>
    </div>
    
    <div className="card">
      <div className="search-bar" style={{ width: '100%', marginBottom: '24px', background: 'rgba(0,0,0,0.2)' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search by name, ID, phone number..." />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Vehicles Linked</th>
            <th>Trees Assigned</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1,2,3,4,5].map(i => (
            <tr key={i}>
              <td>PR-00{i}</td>
              <td>Citizen {i}</td>
              <td>+91-987650000{i}</td>
              <td>{i % 3}</td>
              <td>{i * 2}</td>
              <td><span className="status-badge status-active">Active</span></td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={14}/></button>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Edit size={14}/></button>
                  <button className="icon-btn" style={{ width: 28, height: 28, color: '#ff3d00' }}><Trash2 size={14}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
