import { Trash2, Play, RefreshCw } from 'lucide-react';
import VirtualGrid from './VirtualGrid';

export default function TrashGrid({ items, onItemClick, onEmptyTrash }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper trash-empty">
          <Trash2 size={48} className="empty-icon text-muted" />
        </div>
        <h3>Lixeira vazia</h3>
        <p>Itens que você mover para a lixeira aparecerão aqui.</p>
      </div>
    );
  }

  const renderItem = (item) => (
    <div key={item.id} className="grid-item trash-item" onClick={() => onItemClick(item)}>
      {item.type === 'video' ? (
        <div className="grid-video-preview">
          <video src={`${item.url}#t=0.1`} className="grid-media" muted playsInline preload="metadata" />
          <div className="video-badge">
            <Play size={12} fill="currentColor" />
            <span>{item.duration || 'Video'}</span>
          </div>
        </div>
      ) : (
        <img src={item.url} alt={item.title} className="grid-media" loading="lazy" />
      )}
      <div className="grid-item-info">
        <span className="grid-item-title">{item.title}</span>
      </div>
      <div className="trash-overlay-hint">
        <RefreshCw size={18} />
        <span>Ver Opções</span>
      </div>
    </div>
  );

  return (
    <div className="grid-container">
      <div className="grid-header">
        <div className="title-section">
          <h2>Lixeira</h2>
          <span className="count-badge trash-count">{items.length} itens</span>
        </div>
        <button className="btn-empty-trash" onClick={onEmptyTrash}>
          <Trash2 size={16} />
          <span>Esvaziar</span>
        </button>
      </div>

      <VirtualGrid items={items} renderItem={renderItem} />
    </div>
  );
}