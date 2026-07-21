import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet marker icon in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface TreesFormData {
  _id?: string;
  treeId?: string;
  treeName: string;
  species: string;
  category: string;
  phone: string;
  userId?: string;
  vehicleNumber: string;
  plantedDate: string;
  state: string;
  district: string;
  zone: string;
  address: string;
  latitude: number | '';
  longitude: number | '';
  status: string;
  remarks: string;
}

const LocationPicker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} />;
};

export const TreeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editTree = location.state?.tree;
  const isEditing = !!editTree;

  const initialForm: TreesFormData = {
    treeName: "",
    species: "",
    category: "",
    phone: "",
    vehicleNumber: "",
    plantedDate: new Date().toISOString().split('T')[0],
    state: "",
    district: "",
    zone: "",
    address: "",
    latitude: '',
    longitude: '',
    status: "PLANTED",
    remarks: "",
  };

  const [formData, setFormData] = useState<TreesFormData>(editTree || initialForm);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  // Map state
  const defaultCenter: [number, number] = [22.7196, 75.8577]; // Indore
  const [mapPosition, setMapPosition] = useState<[number, number]>(
    formData.latitude && formData.longitude 
      ? [Number(formData.latitude), Number(formData.longitude)] 
      : defaultCenter
  );

  // Sync formData changes to map if edited manually
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMapPosition([Number(formData.latitude), Number(formData.longitude)]);
    }
  }, [formData.latitude, formData.longitude]);

  const handleMapClick = (pos: [number, number]) => {
    setMapPosition(pos);
    // Manually trigger change event for form data
    setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Mock search user and vehicles
  const handleSearchUser = () => {
    if (formData.phone.length >= 10) {
      setSearching(true);
      setTimeout(() => {
        setVehicles(["MP09ZK5863", "MP04AB1234"]);
        setSearching(false);
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate passing the result back via navigation state or API
    navigate("/trees", { state: { savedTree: formData, isEditing } });
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>{isEditing ? "Edit Tree" : "Register Tree"}</h1>
          <p>Provide the details of the tree planted and its location.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} className="modal-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Tree Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="treeName" value={formData.treeName} onChange={handleChange} required placeholder="Enter tree name (e.g., Neem)" />
              </div>
              <div className="form-group">
                <label>Species <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="species" value={formData.species} onChange={handleChange} required placeholder="Enter botanical or local species name" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Shade">Shade</option>
                  <option value="Medicinal">Medicinal</option>
                  <option value="Ornamental">Ornamental</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Plantation Date</label>
                <input type="date" name="plantedDate" value={formData.plantedDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Search User by Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter user's 10-digit mobile number" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" onClick={handleSearchUser} disabled={searching}>
                    <Search size={16} /> {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              {vehicles.length > 0 && (
                <div className="form-group">
                  <label>Select User's Vehicle</label>
                  <select name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange}>
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="PLANTED">Planted</option>
                  <option value="HEALTHY">Healthy</option>
                  <option value="GROWING">Growing</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="DEAD">Dead</option>
                </select>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Enter State" />
              </div>
              <div className="form-group">
                <label>District & Zone</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" style={{ flex: 1 }} />
                  <input type="text" name="zone" value={formData.zone} onChange={handleChange} placeholder="Zone" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" />
              </div>
              
              <div className="form-group" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                <label>Pick Location on Map</label>
                <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0', marginBottom: '8px' }}>
                  <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={mapPosition} setPosition={handleMapClick} />
                  </MapContainer>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#666' }}>Latitude</label>
                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Lat" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#666' }}>Longitude</label>
                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Lng" />
                  </div>
                </div>
              </div>
            </div>

            {/* FULL WIDTH */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} placeholder="Any additional details or observations..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0', resize: 'vertical' }} />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '32px', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-danger" onClick={() => navigate("/trees")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "Update Tree" : "Register Tree"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
