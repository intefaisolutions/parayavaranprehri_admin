import React from 'react';
import { UserCheck, Search, Plus, Filter, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';

export const MitrasView = () => (
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>Paryavaran Mitra Management</h1>
        <p>Manage volunteers responsible for tree care and monitoring.</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="icon-btn" title="Filter"><Filter size={18} /></button>
        <button className="btn-primary"><Plus size={18} /> Assign Mitra</button>
      </div>
    </div>
    
    <div className="card">
      <div className="search-bar" style={{ width: '100%', marginBottom: '24px', background: 'rgba(0,0,0,0.2)' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search by Mitra ID, Name, Zone, Vidhan Sabha..." />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mitra ID</th>
            <th>Name</th>
            <th>Vidhan Sabha</th>
            <th>Assigned Zone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1,2,3,4,5].map(i => (
            <tr key={i}>
              <td>PM-00{i}</td>
              <td>Volunteer {i}</td>
              <td>Rau</td>
              <td>Zone {String.fromCharCode(64 + i)}</td>
              <td>
                {i % 3 === 0 ? (
                  <span className="status-badge" style={{ background: 'rgba(255, 179, 0, 0.1)', color: '#ffb300' }}>Pending</span>
                ) : (
                  <span className="status-badge status-active">Approved</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {i % 3 === 0 ? (
                    <>
                      <button className="icon-btn" style={{ width: 28, height: 28, color: '#00e676' }} title="Approve"><CheckCircle size={14}/></button>
                      <button className="icon-btn" style={{ width: 28, height: 28, color: '#ff3d00' }} title="Reject"><XCircle size={14}/></button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={14}/></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Edit size={14}/></button>
                      <button className="icon-btn" style={{ width: 28, height: 28, color: '#ff3d00' }}><Trash2 size={14}/></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
