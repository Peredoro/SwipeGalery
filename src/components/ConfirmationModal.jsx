import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-icon-container">
            <AlertTriangle className="modal-warning-icon" />
          </div>
          <h3>Esvaziar Lixeira?</h3>
        </div>
        <p className="modal-body">
          Tem certeza de que deseja excluir permanentemente todos os itens da lixeira? Esta ação não pode ser desfeita.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm-delete" onClick={() => {
            onConfirm();
            onClose();
          }}>
            Sim, excluir tudo
          </button>
        </div>
      </div>
    </div>
  );
}
