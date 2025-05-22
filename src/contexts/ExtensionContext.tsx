import React, { createContext, useContext, useState } from 'react';
import { ExtensionPoint } from '../types';

interface ExtensionContextType {
  extensions: ExtensionPoint[];
  registerExtension: (extension: ExtensionPoint) => void;
  unregisterExtension: (id: string) => void;
  getExtensionsForPoint: (pointId: string) => React.ComponentType<any>[];
}

const ExtensionContext = createContext<ExtensionContextType | undefined>(undefined);

export const useExtension = () => {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error('useExtension must be used within an ExtensionProvider');
  }
  return context;
};

export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensions, setExtensions] = useState<ExtensionPoint[]>([]);

  const registerExtension = (extension: ExtensionPoint) => {
    setExtensions(prev => [...prev, extension]);
  };

  const unregisterExtension = (id: string) => {
    setExtensions(prev => prev.filter(ext => ext.id !== id));
  };

  const getExtensionsForPoint = (pointId: string): React.ComponentType<any>[] => {
    return extensions
      .filter(ext => ext.id === pointId)
      .map(ext => ext.component);
  };

  return (
    <ExtensionContext.Provider value={{
      extensions,
      registerExtension,
      unregisterExtension,
      getExtensionsForPoint
    }}>
      {children}
    </ExtensionContext.Provider>
  );
};