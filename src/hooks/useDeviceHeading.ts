import { useCallback, useEffect, useMemo, useState } from "react";

type DeviceOrientationPermissionAPI = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const hasWindow = typeof window !== "undefined";

export const useDeviceHeading = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = useMemo(() => {
    if (!hasWindow) {
      return false;
    }

    return "DeviceOrientationEvent" in window;
  }, []);

  const enable = useCallback(async () => {
    if (!isSupported) {
      setError("Сенсоры устройства недоступны в этом браузере.");
      return false;
    }

    const orientationAPI =
      DeviceOrientationEvent as DeviceOrientationPermissionAPI;

    if (typeof orientationAPI.requestPermission === "function") {
      const permission = await orientationAPI.requestPermission();

      if (permission !== "granted") {
        setError("Доступ к сенсорам не был предоставлен.");
        return false;
      }
    }

    setError(null);
    setIsEnabled(true);
    return true;
  }, [isSupported]);

  useEffect(() => {
    if (!isEnabled || !isSupported) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha !== "number") {
        return;
      }

      // Переводим компасное значение в угол поворота яхты на сцене.
      const nextHeading = (360 - event.alpha) % 360;
      setHeading(nextHeading);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [isEnabled, isSupported]);

  return {
    heading,
    isEnabled,
    isSupported,
    error,
    enable,
  };
};
