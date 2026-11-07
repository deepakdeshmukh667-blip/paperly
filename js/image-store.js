/**
 * PAPERLY — Persistent Central Image Store (IndexedDB)
 * Stores full-resolution uploaded, stock, and AI-generated photographs.
 * Eliminates localStorage quota issues and ensures 100% persistent image rendering.
 */

const PAPERLY_IMAGE_STORE = (() => {
  const DB_NAME = 'paperly_media_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'images';

  let dbPromise = null;

  function getDB() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('created', 'created', { unique: false });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  // Generate unique image ID
  function genId() {
    return 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Central Image Model Factory
   * @param {Object} params
   * @returns {Object} Normalized PaperlyImageModel
   */
  function createImageModel({
    id = genId(),
    src = '',
    type = 'upload', // 'upload' | 'ai' | 'stock'
    width = 800,
    height = 600,
    fit = 'cover', // 'cover' | 'contain'
    position = 'center', // 'center' | 'top' | 'bottom'
    filename = 'photograph.jpg',
    blob = null,
    focalPoint = { x: 0.5, y: 0.5 },
    dominantColors = []
  } = {}) {
    return {
      id,
      src,
      type,
      width,
      height,
      fit,
      position,
      filename,
      focalPoint,
      dominantColors,
      created: new Date().toISOString()
    };
  }

  /**
   * Save a File or Blob into IndexedDB
   * @param {File|Blob|string} input 
   * @param {Object} meta 
   * @returns {Promise<Object>} PaperlyImageModel
   */
  async function saveImage(input, meta = {}) {
    const db = await getDB();
    const id = meta.id || genId();

    let blob;
    let dataUrl = '';
    let filename = meta.filename || 'photograph.jpg';

    if (input instanceof File) {
      filename = input.name;
      blob = input;
      dataUrl = await blobToDataUrl(input);
    } else if (input instanceof Blob) {
      blob = input;
      dataUrl = await blobToDataUrl(input);
    } else if (typeof input === 'string') {
      if (input.startsWith('data:')) {
        dataUrl = input;
        blob = dataUrlToBlob(input);
      } else {
        // Remote URL (stock photo or Cloudflare R2)
        dataUrl = input;
      }
    }

    // Inspect image dimensions if possible
    let dims = { width: meta.width || 800, height: meta.height || 600 };
    if (dataUrl) {
      dims = await getImageDimensions(dataUrl).catch(() => dims);
    }

    const model = createImageModel({
      id,
      src: dataUrl,
      type: meta.type || 'upload',
      width: dims.width,
      height: dims.height,
      fit: meta.fit || 'cover',
      position: meta.position || 'center',
      filename,
      focalPoint: meta.focalPoint || { x: 0.5, y: 0.5 },
      dominantColors: meta.dominantColors || []
    });

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        ...model,
        blob: blob || null
      };

      const putReq = store.put(record);
      putReq.onsuccess = () => resolve(model);
      putReq.onerror = () => reject(putReq.error);
    });
  }

  /**
   * Retrieve an image model from IndexedDB
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async function getImage(id) {
    if (!id) return null;
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const res = req.result;
        if (!res) return resolve(null);
        if (res.blob && (!res.src || !res.src.startsWith('data:'))) {
          res.src = URL.createObjectURL(res.blob);
        }
        resolve(res);
      };
      req.onerror = () => resolve(null);
    });
  }

  /**
   * List all stored images
   */
  async function getAllImages() {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Delete an image by ID
   */
  async function deleteImage(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Utility Helpers ---
  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }

  function getImageDimensions(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  }

  return {
    createImageModel,
    saveImage,
    getImage,
    getAllImages,
    deleteImage
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_IMAGE_STORE = PAPERLY_IMAGE_STORE;
}

