import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editTask = location.state?.task;

  const [formData, setFormData] = useState(
    editTask || {
      id: "",
      taskTitle: "",
      taskType: "",
      assignedMitra: "",
      vidhanSabha: "",
      zone: "",
      sector: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // API call or state update here

    navigate("/tasks");
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <h1>{editTask ? "Edit Task" : "Add Task"}</h1>
      </div>

      <div className="card">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task ID</label>
            <input
              name="id"
              value={formData.id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Task Title</label>
            <input
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Task Type</label>
            <select
              name="taskType"
              value={formData.taskType}
              onChange={handleChange}
            >
              <option>Survey</option>
              <option>Plantation</option>
              <option>Inspection</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Mitra</label>
            <input
              name="assignedMitra"
              value={formData.assignedMitra}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Vidhan Sabha</label>
            <input
              name="vidhanSabha"
              value={formData.vidhanSabha}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Zone</label>
            <input
              name="zone"
              value={formData.zone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Sector</label>
            <input
              name="sector"
              value={formData.sector}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={() => navigate("/tasks")}
            >
              Cancel
            </button>

            <button className="btn-primary" type="submit">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};