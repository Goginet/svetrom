import { useEffect, useMemo, useState } from "react";
import { BoatDiagram, type RigControls } from "./components/BoatDiagram";
import { useDeviceWindAngle } from "./hooks/useDeviceWindAngle";
import { getCourseInfo } from "./lib/sailing";

const INITIAL_CONTROLS: RigControls = {
  boomLength: 160,
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
    label: "Положение пуза грота",
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
  const [activeTab, setActiveTab] = useState<"controls" | "settings">("controls");
  const deviceWind = useDeviceWindAngle();
  const apparentWindAngle = Math.abs(controls.windAngle);
  const courseInfo = useMemo(
    () => getCourseInfo(apparentWindAngle),
    [apparentWindAngle],
  );
  const tackPhrase = useMemo(() => {
    if (controls.windAngle > 0) {
      return "правого галса";
    }

    if (controls.windAngle < 0) {
      return "левого галса";
    }

    return null;
  }, [controls.windAngle]);
  const courseModeLabel = useMemo(() => {
    if (courseInfo.name === "Бейдевинд") {
      return apparentWindAngle < 47.5 ? "Крутой" : "Полный";
    }

    if (courseInfo.name === "Бакштаг") {
      return apparentWindAngle < 140 ? "Крутой" : "Полный";
    }

    return null;
  }, [apparentWindAngle, courseInfo.name]);
  const courseSummary = useMemo(() => {
    const parts = [
      courseModeLabel,
      courseInfo.name,
      tackPhrase,
    ].filter(Boolean);

    return parts.join(" ");
  }, [courseInfo.name, courseModeLabel, tackPhrase]);

  const primaryControls = useMemo(
    () => CONTROL_CONFIG.filter((item) => item.primary),
    [],
  );
  const advancedControls = useMemo(
    () => CONTROL_CONFIG.filter((item) => !item.primary),
    [],
  );

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
      <section className="diagram-stack">
        <div className="panel panel--diagram">
          <BoatDiagram controls={controls} mode="embedded" />
        </div>

        <section
          className="panel panel--course-info"
          style={{ borderColor: `${courseInfo.accent}66` }}
        >
          <p className="course-info__summary" style={{ color: courseInfo.accent }}>
            {courseSummary}
          </p>
          <p className="course-info__angle">
            Угол к ветру {Math.round(apparentWindAngle)}°
          </p>
          <p className="course-info__description">{courseInfo.description}</p>
        </section>

        <section className="panel panel--primary-controls">
          <div className="panel--primary-controls__header">
            <div className="tab-switcher" role="tablist" aria-label="Переключение панели параметров">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "controls"}
                className={`tab-switcher__button${activeTab === "controls" ? " tab-switcher__button--active" : ""}`}
                onClick={() => setActiveTab("controls")}
              >
                Управление
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "settings"}
                className={`tab-switcher__button${activeTab === "settings" ? " tab-switcher__button--active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Настройки
              </button>
            </div>
          </div>

          {activeTab === "controls" ? (
            <>
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
                        Отключить
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
            </>
          ) : (
            <div className="control-grid control-grid--inline">
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
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
