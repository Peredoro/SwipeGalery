import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Trash2, Check, RotateCcw } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

export default function SwipeCard({
  item,
  isTrashMode,
  onSwipeLeft,
  onSwipeRight,
  onGoBack
}) {
  const [drag, setDrag] = useState({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const [dismissDirection, setDismissDirection] = useState(null);
  const cardRef = useRef(null);

  // Reset states when the item changes
  useEffect(() => {
    setDrag({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
    setDismissDirection(null);
  }, [item]);

  const handleStart = (clientX, clientY) => {
    if (dismissDirection) return;
    setDrag({
      active: true,
      startX: clientX,
      startY: clientY,
      x: 0,
      y: 0
    });
  };

  const handleMove = (clientX, clientY) => {
    if (!drag.active) return;
    const x = clientX - drag.startX;
    const y = clientY - drag.startY;
    setDrag(prev => ({ ...prev, x, y }));
  };

  const handleEnd = () => {
    if (!drag.active) return;

    const threshold = 120;
    if (drag.x > threshold) {
      // Swipe Right
      animateDismiss('right');
    } else if (drag.x < -threshold) {
      // Swipe Left
      animateDismiss('left');
    } else {
      // Spring back
      setDrag({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
    }
  };

  const animateDismiss = (direction) => {
    setDismissDirection(direction);
    setDrag(prev => ({ ...prev, active: false }));
    
    // Trigger action after translation animation finishes
    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight(item);
      } else {
        onSwipeLeft(item);
      }
    }, 300);
  };

  // Touch handlers
  const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  // Mouse handlers (for desktop testing)
  const onMouseDown = (e) => {
    // Only drag with left click
    if (e.button !== 0) return;
    handleStart(e.clientX, e.clientY);
    
    const onMouseMove = (moveEvent) => handleMove(moveEvent.clientX, moveEvent.clientY);
    const onMouseUp = () => {
      handleEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Calculate dynamics based on drag distance
  const rotate = drag.x * 0.05; // 1 degree per 20px
  const opacity = Math.min(Math.abs(drag.x) / 200, 0.7); // cap opacity overlay at 0.7
  
  // Style for card container
  let cardStyle = {};
  if (dismissDirection) {
    cardStyle = {
      transform: `translateX(${dismissDirection === 'right' ? '150%' : '-150%'} ) rotate(${dismissDirection === 'right' ? 30 : -30}deg)`,
      transition: 'transform 0.3s ease-out',
      pointerEvents: 'none'
    };
  } else if (drag.active) {
    cardStyle = {
      transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
      transition: 'none',
      cursor: 'grabbing'
    };
  } else {
    cardStyle = {
      transform: 'translate(0px, 0px) rotate(0deg)',
      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };
  }

  // Determine color and action label based on drag direction
  let overlayColorClass = '';
  let actionLabel = '';

  if (drag.x > 0) {
    // Swiping Right
    overlayColorClass = 'overlay-green';
    actionLabel = isTrashMode ? 'RESTAURAR' : 'MANTER';
  } else if (drag.x < 0) {
    // Swiping Left
    if (isTrashMode) {
      overlayColorClass = 'overlay-red';
      actionLabel = 'EXCLUIR';
    } else {
      overlayColorClass = 'overlay-yellow';
      actionLabel = 'LIXEIRA';
    }
  }

  return (
    <div className="swipe-card-screen">
      {/* Header with back button */}
      <div className="swipe-card-header">
        <button className="back-btn" onClick={onGoBack} aria-label="Voltar para grade">
          <ChevronLeft size={28} />
          <span>Voltar</span>
        </button>
        <span className="card-title-badge">{item.title}</span>
        <div style={{ width: 44 }}></div> {/* spacer */}
      </div>

      {/* Card Arena */}
      <div className="card-arena">
        <div
          ref={cardRef}
          className="swipe-card"
          style={cardStyle}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Dynamic Visual Color Blending Overlay */}
          {drag.active && Math.abs(drag.x) > 10 && (
            <div
              className={`card-color-overlay ${overlayColorClass}`}
              style={{ opacity: opacity }}
            >
              <div className="swipe-action-badge">{actionLabel}</div>
            </div>
          )}

          {/* Media Content */}
          <div className="card-media-wrapper">
            {item.type === 'video' ? (
              <VideoPlayer url={item.url} isActive={!dismissDirection} />
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="card-image-content"
                draggable="false"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (Footer) */}
      <div className="card-actions-footer">
        {isTrashMode ? (
          <>
            {/* Delete button (Left) */}
            <button
              className="action-btn delete-btn"
              onClick={() => animateDismiss('left')}
              title="Excluir Permanentemente"
            >
              <Trash2 size={28} />
            </button>
            {/* Restore button (Right) */}
            <button
              className="action-btn restore-btn"
              onClick={() => animateDismiss('right')}
              title="Restaurar para Galeria"
            >
              <RotateCcw size={28} />
            </button>
          </>
        ) : (
          <>
            {/* Move to Trash button (Left) */}
            <button
              className="action-btn trash-btn"
              onClick={() => animateDismiss('left')}
              title="Mover para Lixeira"
            >
              <Trash2 size={28} />
            </button>
            {/* Keep button (Right) */}
            <button
              className="action-btn keep-btn"
              onClick={() => animateDismiss('right')}
              title="Manter na Galeria"
            >
              <Check size={28} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
