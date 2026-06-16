import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function VideoPlayer({ url, isActive }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Pause video if card becomes inactive
  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.log("Play interrupted:", err));
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="video-player-container" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={`${url}#t=0.1`}
        className="video-element"
        loop
        playsInline
        muted={isMuted}
        preload="auto"
      />
      
      {/* Play/Pause Large Center Overlay */}
      {!isPlaying && (
        <div className="video-overlay-play">
          <div className="play-icon-circle">
            <Play size={32} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Video controls header/footer overlay */}
      <div className="video-controls-overlay">
        <button className="control-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button className="control-btn" onClick={toggleMute}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
