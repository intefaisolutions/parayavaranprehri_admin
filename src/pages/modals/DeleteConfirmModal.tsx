import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personName?: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  personName,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Delete Person</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{personName}</strong>?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;