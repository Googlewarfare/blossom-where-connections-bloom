import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

export const useCamera = () => {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const takePhoto = async (): Promise<Photo | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      
      setPhoto(image);
      return image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to take photo';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async (): Promise<Photo | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      
      setPhoto(image);
      return image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick photo';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickOrTake = async (): Promise<Photo | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      
      setPhoto(image);
      return image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get photo';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    return await Camera.checkPermissions();
  };

  const requestPermissions = async () => {
    return await Camera.requestPermissions();
  };

  return {
    photo,
    loading,
    error,
    isNative,
    takePhoto,
    pickFromGallery,
    pickOrTake,
    checkPermissions,
    requestPermissions,
  };
};
