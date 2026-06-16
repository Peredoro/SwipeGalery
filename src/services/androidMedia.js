import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const TRASH_DIR_NAME = 'Lixeira_Swipe';
const TRASH_PATH = `DCIM/Camera/${TRASH_DIR_NAME}`;
const METADATA_PATH = `${TRASH_PATH}/.trash_metadata.json`;

let _baseUri = null;

export const isAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export const requestStoragePermissions = async () => {
  if (!isAndroid()) return true;
  try {
    const status = await Filesystem.requestPermissions();
    return status.publicStorage === 'granted';
  } catch (e) {
    console.error('Erro ao solicitar permissões de armazenamento:', e);
    return false;
  }
};

export const checkStoragePermissions = async () => {
  if (!isAndroid()) return true;
  try {
    const status = await Filesystem.checkPermissions();
    return status.publicStorage === 'granted';
  } catch (e) {
    console.error('Erro ao verificar permissões de armazenamento:', e);

    return false;
  }
};

const getBaseUri = async () => {
  if (_baseUri) return _baseUri;
  const result = await Filesystem.getUri({
    directory: Directory.ExternalStorage,
    path: ''
  });
  _baseUri = result.uri.replace(/\/+$/, '');
  return _baseUri;
};

const ensureTrashDir = async () => {
  try {
    await Filesystem.mkdir({
      directory: Directory.ExternalStorage,
      path: TRASH_PATH,
      recursive: true
    });
  } catch (e) {
    console.error('Erro ao criar diretório da lixeira:', e);
    // ignora se já existe
  }
};

export const getAndroidGallery = async () => {
  if (!isAndroid()) return [];
  await ensureTrashDir();

  try {
    const result = await Capacitor.nativePromise('MediaScanner', 'scanMediaFiles', {});

    const files = result?.files || [];
    return files.map(f => ({
      id: `android-gallery-${f.path}`,
      name: f.name,
      path: f.path,
      type: f.isVideo ? 'video' : 'image',
      url: Capacitor.convertFileSrc('file://' + f.path),
      title: f.name,
      mtime: f.mtime,
      size: f.size,
      mimeType: f.mimeType,
      aspectRatio: 'unknown',
      duration: f.isVideo ? 'Vídeo' : undefined
    }));

  } catch (e) {
    alert('ERRO MediaScanner: ' + (e?.message || JSON.stringify(e)));
    return [];
  }
};

export const getAndroidTrash = async () => {
  if (!isAndroid()) return [];
  await ensureTrashDir();
  const baseUri = await getBaseUri();

  const MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.mp4', '.3gp', '.mkv', '.mov', '.avi'];

  try {
    const result = await Filesystem.readdir({
      directory: Directory.ExternalStorage,
      path: TRASH_PATH
    });
    const items = [];
    for (const f of result.files) {
      const name = typeof f === 'object' ? f.name : f;
      if (name === '.trash_metadata.json') continue;
      const lower = name.toLowerCase();
      const isMedia = MEDIA_EXTENSIONS.some(ext => lower.endsWith(ext));
      if (!isMedia) continue;
      const isVideo = ['.mp4', '.3gp', '.mkv', '.mov', '.avi'].some(ext => lower.endsWith(ext));
      const fileUri = `${baseUri}/${TRASH_PATH}/${name}`;
      items.push({
        id: `android-trash-${name}`,
        name,
        path: `${baseUri.replace('file://', '')}/${TRASH_PATH}/${name}`,
        type: isVideo ? 'video' : 'image',
        url: Capacitor.convertFileSrc(fileUri),
        title: name,
        aspectRatio: 'unknown',
        duration: isVideo ? 'Vídeo' : undefined
      });
    }
    return items;
  } catch (e) {
    console.error('Erro ao ler arquivos da lixeira:', e);
    return [];
  }
};

const getTrashMetadata = async () => {
  try {
    const result = await Filesystem.readFile({
      directory: Directory.ExternalStorage,
      path: METADATA_PATH,
      encoding: 'utf8'
    });
    return JSON.parse(result.data);
  } catch (e) {
    console.error('Erro ao ler metadata:', e);
    return {};
  }
};

const saveTrashMetadata = async (metadata) => {
  try {
    await Filesystem.writeFile({
      directory: Directory.ExternalStorage,
      path: METADATA_PATH,
      data: JSON.stringify(metadata),
      encoding: 'utf8',
      recursive: true
    });
  } catch (e) {
    console.error('Erro ao salvar metadata:', e);
  }
};

export const moveAndroidFileToTrash = async (item) => {
  if (!isAndroid()) return false;
  try {
    await ensureTrashDir();
    const baseUri = await getBaseUri();
    const fromPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
    const toPath = `${baseUri.replace('file://', '')}/${TRASH_PATH}/${item.name}`;

    await Filesystem.rename({
      from: 'file://' + fromPath,
      to: 'file://' + toPath
    });

    const metadata = await getTrashMetadata();
    metadata[item.name] = fromPath;
    await saveTrashMetadata(metadata);
    return true;
  } catch (e) {
    console.error('moveAndroidFileToTrash error:', e);
    alert(`Erro ao mover para lixeira: ${e.message || JSON.stringify(e)}`);
    return false;
  }
};

export const restoreAndroidFileFromTrash = async (item) => {
  if (!isAndroid()) return false;
  try {
    const metadata = await getTrashMetadata();
    const originalPath = metadata[item.name];
    if (!originalPath) {
      alert(`Caminho original não encontrado para: ${item.name}`);
      return false;
    }
    const baseUri = await getBaseUri();
    const trashPath = `${baseUri.replace('file://', '')}/${TRASH_PATH}/${item.name}`;
    const toPath = originalPath.startsWith('/') ? originalPath : `/${originalPath}`;

    await Filesystem.rename({
      from: 'file://' + trashPath,
      to: 'file://' + toPath
    });

    const metadata2 = await getTrashMetadata();
    delete metadata2[item.name];
    await saveTrashMetadata(metadata2);
    return true;
  } catch (e) {
    console.error('restoreAndroidFileFromTrash error:', e);
    alert(`Erro ao restaurar: ${e.message || JSON.stringify(e)}`);
    return false;
  }
};

export const deleteAndroidFilePermanently = async (item) => {
  if (!isAndroid()) return false;
  try {
    await Filesystem.deleteFile({
      directory: Directory.ExternalStorage,
      path: `${TRASH_PATH}/${item.name}`
    });
    const metadata = await getTrashMetadata();
    delete metadata[item.name];
    await saveTrashMetadata(metadata);
    return true;
  } catch (e) {
    console.error('deleteAndroidFilePermanently error:', e);
    alert(`Erro ao excluir: ${e.message || JSON.stringify(e)}`);
    return false;
  }
};

export const emptyAndroidTrash = async (items) => {
  if (!isAndroid()) return false;
  try {
    for (const item of items) {
      await Filesystem.deleteFile({
        directory: Directory.ExternalStorage,
        path: `${TRASH_PATH}/${item.name}`
      });
    }
    try {
      await Filesystem.deleteFile({
        directory: Directory.ExternalStorage,
        path: METADATA_PATH
      });
    } catch (e) {
      console.error('Erro ao excluir metadata:', e);
    }
    return true;
  } catch (e) {
    console.error('emptyAndroidTrash error:', e);
    return false;
  }
};