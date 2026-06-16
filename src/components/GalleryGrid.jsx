import { Play, Image as ImageIcon } from 'lucide-react';
import VirtualGrid from './VirtualGrid';

export default function GalleryGrid({ items, onItemClick }) {
  const renderItem = (item) => (
    <div key={item.id} className="grid-item" onClick={() => onItemClick(item)}>
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
    </div>
  );

  return (
    <div className="grid-container">
      <div className="grid-header">
        <div className="title-section">
          <h2>Sua Galeria</h2>
          <span className="count-badge">{items.length} itens</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <ImageIcon size={48} className="empty-icon text-muted" />
          </div>
          <h3>Sua galeria está vazia!</h3>
          <p>Nenhuma mídia encontrada no dispositivo.</p>
        </div>
      ) : (
        <VirtualGrid items={items} renderItem={renderItem} />
      )}
    </div>
  );
}