import { useEffect, useMemo, useState } from "react";
import { BoatDiagram, type RigControls } from "./components/BoatDiagram";
import { useDeviceWindAngle } from "./hooks/useDeviceWindAngle";

const INITIAL_CONTROLS: RigControls = {
  boomLength: 180,
  boomAngle: -25,
  windAngle: 50,
  controlPointPercent: 35,
  mainsailDepth: 70,
  hullLength: 320,
  entryAngle: 28,
  midshipPosition: 64,
  transomWidth: 70,
  mastOffsetFromMidship: -40,
};

const CONTROL_CONFIG = [
  {
    key: "boomAngle",
    label: "Угол гика от транца",
    min: -90,
    max: 90,
    step: 1,
    unit: "°",
    primary: true,
  },
  {
    key: "windAngle",
    label: "Угол ветра от носа",
    min: -180,
    max: 180,
    step: 1,
    unit: "°",
    primary: true,
  },
  {
    key: "boomLength",
    label: "Длина гика",
    min: 80,
    max: 240,
    step: 1,
    unit: "px",
    primary: false,
  },
  {
    key: "controlPointPercent",
    label: "Положение точки C",
    min: 10,
    max: 90,
    step: 1,
    unit: "%",
    primary: false,
  },
  {
    key: "mainsailDepth",
    label: "Глубина грота",
    min: 0,
    max: 160,
    step: 1,
    unit: "px",
    primary: false,
  },
  {
    key: "hullLength",
    label: "Длина корпуса",
    min: 220,
    max: 420,
    step: 1,
    unit: "px",
    primary: false,
  },
  {
    key: "entryAngle",
    label: "Угол входа",
    min: 8,
    max: 55,
    step: 1,
    unit: "°",
    primary: false,
  },
  {
    key: "midshipPosition",
    label: "Положение миделя",
    min: 45,
    max: 80,
    step: 1,
    unit: "%",
    primary: false,
  },
  {
    key: "transomWidth",
    label: "Ширина транца",
    min: 20,
    max: 120,
    step: 1,
    unit: "px",
    primary: false,
  },
  {
    key: "mastOffsetFromMidship",
    label: "Сдвиг мачты от миделя",
    min: -120,
    max: 120,
    step: 1,
    unit: "px",
    primary: false,
  },
] as const;

function App() {
  const [controls, setControls] = useState<RigControls>(INITIAL_CONTROLS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const deviceWind = useDeviceWindAngle();

  const primaryControls = useMemo(
    () => CONTROL_CONFIG.filter((item) => item.primary),
    [],
  );
  const advancedControls = useMemo(
    () => CONTROL_CONFIG.filter((item) => !item.primary),
    [],
  );

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!deviceWind.isEnabled || deviceWind.angle === null) {
      return;
    }

    const nextWindAngle = deviceWind.angle;

    setControls((current) => {
      const nextBoomAngle = -nextWindAngle / 2;

      if (
        current.windAngle === nextWindAngle &&
        current.boomAngle === nextBoomAngle
      ) {
        return current;
      }

      return {
        ...current,
        windAngle: nextWindAngle,
        boomAngle: nextBoomAngle,
      };
    });
  }, [deviceWind.angle, deviceWind.isEnabled]);

  const updateControl = <Key extends keyof RigControls>(key: Key, value: number) => {
    setControls((current) => ({
      ...current,
      ...(key === "boomAngle"
        ? {
            boomAngle: value,
            windAngle: -value * 2,
          }
        : key === "windAngle"
          ? {
              windAngle: value,
              boomAngle: -value / 2,
            }
          : {
              [key]: value,
            }),
    }));
  };

  return (
    <main className="page">
      <div className="page__toolbar">
        <button
          type="button"
          className="settings-button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Открыть настройки"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="settings-button__icon">
            <path
              d="M10.9 2.4h2.2l.5 2a7.9 7.9 0 0 1 1.8.8l1.8-1.1 1.6 1.6-1.1 1.8c.3.6.6 1.2.8 1.8l2 .5v2.2l-2 .5a7.9 7.9 0 0 1-.8 1.8l1.1 1.8-1.6 1.6-1.8-1.1a7.9 7.9 0 0 1-1.8.8l-.5 2h-2.2l-.5-2a7.9 7.9 0 0 1-1.8-.8l-1.8 1.1-1.6-1.6 1.1-1.8a7.9 7.9 0 0 1-.8-1.8l-2-.5V10l2-.5a7.9 7.9 0 0 1 .8-1.8L4.4 5.9 6 4.3l1.8 1.1a7.9 7.9 0 0 1 1.8-.8l.5-2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span>Настройки</span>
        </button>
      </div>

      <section className="diagram-stack">
        <div className="panel panel--diagram">
          <BoatDiagram controls={controls} />
        </div>

        <section className="panel panel--primary-controls">
          <h2>Параметры под схемой</h2>
          <div className="primary-control-grid">
            {primaryControls.map((item) => (
              <label key={item.key} className="control">
                <span className="control__header">
                  <span>{item.label}</span>
                  <strong>
                    {controls[item.key]}
                    {item.unit}
                  </strong>
                </span>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={controls[item.key]}
                  disabled={deviceWind.isEnabled}
                  onChange={(event) =>
                    updateControl(item.key, Number(event.target.value))
                  }
                />
              </label>
            ))}
          </div>

          <div className="sensor-bar">
            <div className="sensor-bar__copy">
              <strong>Поворот телефона</strong>
              <span>
                {deviceWind.isEnabled
                  ? "Угол ветра управляется датчиком устройства."
                  : "Можно привязать угол ветра к повороту телефона."}
              </span>
              {deviceWind.error ? (
                <span className="sensor-bar__message">{deviceWind.error}</span>
              ) : null}
            </div>

            <div className="sensor-bar__actions">
              {deviceWind.isEnabled ? (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => deviceWind.calibrate()}
                  >
                    Переустановить ноль
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => deviceWind.disable()}
                  >
                    Отключить датчик
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!deviceWind.isSupported}
                  onClick={() => {
                    void deviceWind.enable();
                  }}
                >
                  Включить поворот телефона
                </button>
              )}
            </div>
          </div>
        </section>
      </section>

      {isSettingsOpen ? (
        <div
          className="settings-modal-backdrop"
          onClick={() => setIsSettingsOpen(false)}
        >
          <section
            className="settings-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="settings-modal__header">
              <div>
                <h2>Настройки</h2>
                <p>Изменения сразу видны на схеме под модальным окном.</p>
              </div>
              <button
                type="button"
                className="settings-modal__close"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Закрыть настройки"
              >
                x
              </button>
            </div>

            <div className="control-grid control-grid--modal">
              {advancedControls.map((item) => (
                <label key={item.key} className="control">
                  <span className="control__header">
                    <span>{item.label}</span>
                    <strong>
                      {controls[item.key]}
                      {item.unit}
                    </strong>
                  </span>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={controls[item.key]}
                    onChange={(event) =>
                      updateControl(item.key, Number(event.target.value))
                    }
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
