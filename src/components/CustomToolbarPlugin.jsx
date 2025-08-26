import { createStore } from '@react-pdf-viewer/core';

const createCustomToolbarPlugin = (onZoomChange, onPageChange) => {
  const store = createStore({
    zoom: 1,
    currentPage: 1,
    numPages: 1,
  });

  return {
    store,
    onDocumentLoad: (e) => {
      store.update('numPages', e.numPages);
      store.update('currentPage', 1);
      store.update('zoom', 1);
    },
    onPageChange: (e) => {
      store.update('currentPage', e.currentPage);
      onPageChange?.(e.currentPage);
    },
    onZoom: (e) => {
      store.update('zoom', e.scale);
      onZoomChange?.(e.scale);
    },
  };
};

export default createCustomToolbarPlugin;
