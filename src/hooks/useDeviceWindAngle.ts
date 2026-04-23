import { useCallback, useEffect, useMemo, useState } from "react";

type DeviceOrientationPermissionAPI = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const hasWindow = typeof window !== "undefined";

const normalizeSignedAngle = (angle: number): number => {
  const normalized = ((angle + 180) % 360 + 360) % 360 - 180;
  return Math.round(normalized);
};

export const useDeviceWindAngle = () => {
  const [absoluteAngle, setAbsoluteAngle] = useState<number | null>(null);
  const [baselineAngle, setBaselineAngle] = useState<number | null>(null);
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

    setBaselineAngle(null);
    setError(null);
    setIsEnabled(true);
    return true;
  }, [isSupported]);

  const disable = useCallback(() => {
    setIsEnabled(false);
    setError(null);
  }, []);

  const calibrate = useCallback(() => {
    if (absoluteAngle === null) {
      return;
    }

    setBaselineAngle(absoluteAngle);
  }, [absoluteAngle]);

  useEffect(() => {
    if (!isEnabled || !isSupported) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha !== "number") {
        return;
      }

      const nextAngle = event.alpha % 360;
      setAbsoluteAngle(nextAngle);
      setBaselineAngle((current) => current ?? nextAngle);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [isEnabled, isSupported]);

  const angle = useMemo(() => {
    if (absoluteAngle === null || baselineAngle === null) {
      return null;
    }

    return normalizeSignedAngle(absoluteAngle - baselineAngle);
  }, [absoluteAngle, baselineAngle]);

  return {
    angle,
    isEnabled,
    isSupported,
    error,
    enable,
    disable,
    calibrate,
  };
};
