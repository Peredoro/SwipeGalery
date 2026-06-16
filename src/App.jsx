import { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { initialMediaItems } from './mockData';
import GalleryGrid from './components/GalleryGrid';
import TrashGrid from './components/TrashGrid';
import SwipeCard from './components/SwipeCard';
import ConfirmationModal from './components/ConfirmationModal';
import {
  isAndroid,
  getAndroidGallery,
  getAndroidTrash,
  moveAndroidFileToTrash,
  restoreAndroidFileFromTrash,
  deleteAndroidFilePermanently,
  emptyAndroidTrash
} from './services/androidMedia';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryItems, setGalleryItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMedia = async () => {
      setLoading(true);
      if (isAndroid()) {
        try {
          const [gallery, trash] = await Promise.all([
            getAndroidGallery(),
            getAndroidTrash()
          ]);
          setGalleryItems(gallery);
          setTrashItems(trash);
          setPermissionGranted(true);
        } catch (error) {
          console.error("Erro ao carregar mídias:", error);
          setPermissionGranted(false);
        }
      } else {
        setGalleryItems(initialMediaItems);
        setTrashItems([]);
      }
      setLoading(false);
    };

    initMedia();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveItem(null);
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const advanceQueue = (currentItem, currentList) => {
    const currentIndex = currentList.findIndex(i => i.id === currentItem.id);
    if (currentIndex === -1) { setActiveItem(null); return null; }

    if (currentIndex < currentList.length - 1) {
      return currentList[currentIndex + 1];
    } else if (currentIndex > 0) {
      return currentList[currentIndex - 1];
    }
    return null;
  };

  const handleSwipeLeftGallery = async (item) => {
    if (isAndroid()) {
      const success = await moveAndroidFileToTrash(item);
      if (!success) {
        alert("Não foi possível mover o arquivo para a lixeira.");
        return;
      }
    }

    const nextItem = advanceQueue(item, galleryItems);
    setGalleryItems(prev => prev.filter(i => i.id !== item.id));

    // Recarrega lixeira para URL correta, depois avança
    const updatedTrash = await getAndroidTrash();
    setTrashItems(updatedTrash);
    setActiveItem(nextItem);
  };

  const handleSwipeRightGallery = (item) => {
    const nextItem = advanceQueue(item, galleryItems);
    setActiveItem(nextItem);
  };

  const handleSwipeRightTrash = async (item) => {
    if (isAndroid()) {
      const success = await restoreAndroidFileFromTrash(item);
      if (!success) {
        alert("Não foi possível restaurar o arquivo.");
        return;
      }
    }

    const nextItem = advanceQueue(item, trashItems);
    setTrashItems(prev => prev.filter(i => i.id !== item.id));

    // Recarrega galeria para URL correta, depois avança
    const updatedGallery = await getAndroidGallery();
    setGalleryItems(updatedGallery);
    setActiveItem(nextItem);
  };

  const handleSwipeLeftTrash = async (item) => {
    if (isAndroid()) {
      const success = await deleteAndroidFilePermanently(item);
      if (!success) {
        alert("Não foi possível deletar o arquivo permanentemente.");
        return;
      }
    }

    const nextItem = advanceQueue(item, trashItems);
    setTrashItems(prev => prev.filter(i => i.id !== item.id));
    setActiveItem(nextItem);
  };

  const handleEmptyTrash = async () => {
    if (isAndroid()) {
      await emptyAndroidTrash(trashItems);
    }
    // Limpa estado local — sem rescan
    setTrashItems([]);
  };

  if (!permissionGranted) {
    return (
      <div className="mobile-device-simulator">
        <div className="app-container">
          <div className="empty-state" style={{ marginTop: '140px', padding: '24px' }}>
            <div className="empty-icon-wrapper" style={{ borderColor: 'var(--color-red)' }}>
              <Trash2 size={42} style={{ color: 'var(--color-red)' }} />
            </div>
            <h3>Permissão Necessária</h3>
            <p style={{ fontSize: '13px', margin: '10px 0 20px' }}>
              Este aplicativo precisa de acesso ao armazenamento para gerenciar suas mídias.
            </p>
            <button
              className="btn-import"
              style={{ background: 'var(--accent-purple)', color: 'white', borderColor: 'var(--accent-purple)', padding: '12px 24px', fontSize: '14px' }}
              onClick={async () => {
                try {
                  const [gallery, trash] = await Promise.all([getAndroidGallery(), getAndroidTrash()]);
                  if (gallery.length > 0) {
                    setPermissionGranted(true);
                    setGalleryItems(gallery);
                    setTrashItems(trash);
                  } else {
                    alert("Certifique-se de conceder acesso a Todos os Arquivos nas configurações.");
                  }
                } catch (e) {
                  alert("Erro ao carregar. Verifique as permissões nas configurações do app.", e);
                }
              }}
            >
              Recarregar / Conceder
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mobile-device-simulator">
        <div className="app-container">
          <div className="empty-state" style={{ marginTop: '140px' }}>
            <h3>Carregando mídias...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-device-simulator">
      <div className="app-container">
        <div className="app-content">
          {activeItem ? (
            <SwipeCard
              item={activeItem}
              isTrashMode={activeTab === 'trash'}
              onSwipeLeft={(item) => activeTab === 'trash' ? handleSwipeLeftTrash(item || activeItem) : handleSwipeLeftGallery(item || activeItem)}
              onSwipeRight={(item) => activeTab === 'trash' ? handleSwipeRightTrash(item || activeItem) : handleSwipeRightGallery(item || activeItem)}
              onGoBack={() => setActiveItem(null)}
            />
          ) : (
            <>
              {activeTab === 'gallery' ? (
                <GalleryGrid items={galleryItems} onItemClick={handleItemClick} />
              ) : (
                <TrashGrid items={trashItems} onItemClick={handleItemClick} onEmptyTrash={() => setShowEmptyTrashModal(true)} />
              )}
            </>
          )}
        </div>

        {!activeItem && (
          <nav className="bottom-nav">
            <button className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => handleTabChange('gallery')}>
              <ImageIcon size={22} />
              <span>Galeria</span>
            </button>
            <button className={`nav-tab ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => handleTabChange('trash')}>
              <Trash2 size={22} />
              <span>Lixeira</span>
            </button>
          </nav>
        )}

        <ConfirmationModal
          isOpen={showEmptyTrashModal}
          onClose={() => setShowEmptyTrashModal(false)}
          onConfirm={handleEmptyTrash}
        />
      </div>
    </div>
  );
}