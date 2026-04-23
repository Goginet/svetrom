import { useMemo, useState } from "react";

export interface RigControls {
  boomLength: number;
  boomAngle: number;
  windAngle: number;
  controlPointPercent: number;
  mainsailDepth: number;
  hullLength: number;
  entryAngle: number;
  midshipPosition: number;
  transomWidth: number;
  mastOffsetFromMidship: number;
}

type BoatDiagramProps = {
  controls: RigControls;
  mode?: "embedded" | "fullscreen";
};

const MAST = { x: 220, y: 220 };
type SelectedElement =
  | "pointA"
  | "pointB"
  | "pointC"
  | "boom"
  | "sail"
  | "wind"
  | "hull"
  | "entry"
  | "midship"
  | "transom"
  | "mastOffset"
  | null;

const format = (value: number) => value.toFixed(1);

export const BoatDiagram = ({
  controls,
  mode = "embedded",
}: BoatDiagramProps) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const boomScreenAngle = -90 + controls.boomAngle;
  const boomAngleInRadians = (boomScreenAngle * Math.PI) / 180;
  const windScreenAngle = 90 - controls.windAngle;
  const windAngleInRadians = (windScreenAngle * Math.PI) / 180;
  const mainsailSide = controls.windAngle >= 0 ? 1 : -1;
  const tackName =
    controls.windAngle > 0
      ? "правый галс"
      : controls.windAngle < 0
        ? "левый галс"
        : "нейтральное положение";
  const boomUnit = {
    x: Math.cos(boomAngleInRadians),
    y: -Math.sin(boomAngleInRadians),
  };
  const normal = {
    x: -boomUnit.y,
    y: boomUnit.x,
  };
  const windUnit = {
    x: Math.cos(windAngleInRadians),
    y: -Math.sin(windAngleInRadians),
  };

  const pointA = MAST;
  const pointB = {
    x: MAST.x + boomUnit.x * controls.boomLength,
    y: MAST.y + boomUnit.y * controls.boomLength,
  };
  const pointCBase = {
    x: MAST.x + boomUnit.x * controls.boomLength * (controls.controlPointPercent / 100),
    y: MAST.y + boomUnit.y * controls.boomLength * (controls.controlPointPercent / 100),
  };
  const pointC = {
    x: pointCBase.x + normal.x * controls.mainsailDepth * mainsailSide,
    y: pointCBase.y + normal.y * controls.mainsailDepth * mainsailSide,
  };
  const windLength = 170;
  const windPoint = {
    x: MAST.x + windUnit.x * windLength,
    y: MAST.y + windUnit.y * windLength,
  };
  const midshipStation = controls.hullLength * (controls.midshipPosition / 100);
  const mastStation = Math.min(
    Math.max(midshipStation + controls.mastOffsetFromMidship, controls.hullLength * 0.22),
    controls.hullLength * 0.82,
  );
  const bowY = MAST.y - mastStation;
  const sternY = bowY + controls.hullLength;
  const midshipY = bowY + midshipStation;
  const halfBeam = Math.max(34, controls.hullLength * 0.14);
  const transomHalf = controls.transomWidth / 2;
  const entryControlLength = controls.hullLength * 0.2;
  const entryAngleInRadians = (controls.entryAngle * Math.PI) / 180;
  const leftMidshipX = MAST.x - halfBeam;
  const rightMidshipX = MAST.x + halfBeam;
  const leftTransomX = MAST.x - transomHalf;
  const rightTransomX = MAST.x + transomHalf;
  const entryTopControl = {
    x: MAST.x + Math.sin(entryAngleInRadians) * entryControlLength,
    y: bowY + Math.cos(entryAngleInRadians) * entryControlLength,
  };
  const entryBottomControl = {
    x: MAST.x - Math.sin(entryAngleInRadians) * entryControlLength,
    y: entryTopControl.y,
  };
  const midshipLead = controls.hullLength * 0.18;
  const sternLead = controls.hullLength * 0.16;
  const hullPath = [
    `M ${format(MAST.x)} ${format(bowY)}`,
    `C ${format(entryTopControl.x)} ${format(entryTopControl.y)} ${format(rightMidshipX)} ${format(midshipY - midshipLead)} ${format(rightMidshipX)} ${format(midshipY)}`,
    `C ${format(rightMidshipX)} ${format(midshipY + midshipLead)} ${format(rightTransomX)} ${format(sternY - sternLead)} ${format(rightTransomX)} ${format(sternY)}`,
    `L ${format(leftTransomX)} ${format(sternY)}`,
    `C ${format(leftTransomX)} ${format(sternY - sternLead)} ${format(leftMidshipX)} ${format(midshipY + midshipLead)} ${format(leftMidshipX)} ${format(midshipY)}`,
    `C ${format(leftMidshipX)} ${format(midshipY - midshipLead)} ${format(entryBottomControl.x)} ${format(entryBottomControl.y)} ${format(MAST.x)} ${format(bowY)}`,
    "Z",
  ].join(" ");

  const sailPath = [
    `M ${format(pointA.x)} ${format(pointA.y)}`,
    `L ${format(pointB.x)} ${format(pointB.y)}`,
    `Q ${format(pointC.x)} ${format(pointC.y)} ${format(pointA.x)} ${format(pointA.y)}`,
    "Z",
  ].join(" ");

  const viewBox = useMemo(() => {
    if (mode === "embedded") {
      return {
        minX: -200,
        minY: 0,
        width: 840,
        height: 440,
      };
    }

    const xs = [
      pointA.x,
      pointB.x,
      pointCBase.x,
      pointC.x,
      windPoint.x,
      MAST.x,
      leftMidshipX,
      rightMidshipX,
      leftTransomX,
      rightTransomX,
      entryTopControl.x,
      entryBottomControl.x,
    ];
    const ys = [
      pointA.y,
      pointB.y,
      pointCBase.y,
      pointC.y,
      windPoint.y,
      bowY,
      sternY,
      midshipY,
      entryTopControl.y,
      entryBottomControl.y,
    ];

    const paddingX = 28;
    const paddingY = 28;
    const minX = Math.min(...xs) - paddingX;
    const maxX = Math.max(...xs) + paddingX;
    const minY = Math.min(...ys) - paddingY;
    const maxY = Math.max(...ys) + paddingY;

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [
    bowY,
    entryBottomControl.x,
    entryBottomControl.y,
    entryTopControl.x,
    entryTopControl.y,
    leftMidshipX,
    leftTransomX,
    midshipY,
    mode,
    pointA.x,
    pointA.y,
    pointB.x,
    pointB.y,
    pointC.x,
    pointC.y,
    pointCBase.x,
    pointCBase.y,
    rightMidshipX,
    rightTransomX,
    sternY,
    windPoint.x,
    windPoint.y,
  ]);

  const labels = useMemo(
    () => ({
      pointA: {
        x: pointA.x + 16,
        y: pointA.y - 18,
        title: "A / Мачта",
        description: "(0, 0) - базовая точка построения.",
      },
      pointB: {
        x: pointB.x + 16,
        y: pointB.y - 18,
        title: "B / Конец гика",
        description: "Конечная точка прямой A-B.",
      },
      pointC: {
        x: pointC.x + 16,
        y: pointC.y - 18,
        title: "C / Контрольная точка",
        description: "Задает пузо грота по кривой Безье.",
      },
      boom: {
        x: (pointA.x + pointB.x) / 2 + 12,
        y: (pointA.y + pointB.y) / 2 - 18,
        title: "Гик",
        description: "Прямая A-B.",
      },
      sail: {
        x: pointC.x + 16,
        y: pointC.y + 26,
        title: "Грот",
        description: `Квадратичная кривая Безье B-C-A. Сейчас: ${tackName}.`,
      },
      wind: {
        x: windPoint.x + 14,
        y: windPoint.y - 12,
        title: "Ветер",
        description: `Угол ветра от линии к носу: ${controls.windAngle}°. Сейчас: ${tackName}.`,
      },
      hull: {
        x: rightMidshipX + 18,
        y: midshipY - 18,
        title: "Контур яхты",
        description: "Силуэт корпуса относительно мачты.",
      },
      entry: {
        x: MAST.x + 18,
        y: bowY + 28,
        title: "Угол входа",
        description: "Определяет остроту носа через первую контрольную точку.",
      },
      midship: {
        x: rightMidshipX + 14,
        y: midshipY - 18,
        title: "Мидель",
        description: "Точка максимальной ширины корпуса.",
      },
      transom: {
        x: rightTransomX + 14,
        y: sternY - 18,
        title: "Транец",
        description: "Ширина кормы на срезе транца.",
      },
      mastOffset: {
        x: MAST.x + 14,
        y: (MAST.y + midshipY) / 2,
        title: "Сдвиг мачты",
        description: "Положение мачты относительно миделя.",
      },
    }),
    [
      pointA.x,
      pointA.y,
      pointB.x,
      pointB.y,
      pointC.x,
      pointC.y,
      bowY,
      midshipY,
      sternY,
      rightMidshipX,
      rightTransomX,
      windPoint.x,
      windPoint.y,
      controls.windAngle,
      tackName,
    ],
  );

  const activeLabel = selectedElement ? labels[selectedElement] : null;

  return (
    <svg
      viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Схема мачты, гика и грота"
      className="diagram"
      onClick={() => setSelectedElement(null)}
    >
      <rect
        x={viewBox.minX}
        y={viewBox.minY}
        width={viewBox.width}
        height={viewBox.height}
        rx="24"
        className="diagram__board"
      />

      <line x1="40" y1={MAST.y} x2="480" y2={MAST.y} className="diagram__axis" />
      <line x1={MAST.x} y1="40" x2={MAST.x} y2="400" className="diagram__axis" />
      <line
        x1={MAST.x}
        y1={MAST.y}
        x2={windPoint.x}
        y2={windPoint.y}
        className={`diagram__wind${selectedElement === "wind" ? " diagram__wind--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("wind");
        }}
      />
      <path
        d={hullPath}
        className={`diagram__hull${selectedElement === "hull" ? " diagram__hull--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("hull");
        }}
      />
      <line
        x1={MAST.x}
        y1={bowY}
        x2={entryTopControl.x}
        y2={entryTopControl.y}
        className={`diagram__guide${selectedElement === "entry" ? " diagram__guide--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("entry");
        }}
      />
      <line
        x1={MAST.x}
        y1={bowY}
        x2={entryBottomControl.x}
        y2={entryBottomControl.y}
        className={`diagram__guide${selectedElement === "entry" ? " diagram__guide--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("entry");
        }}
      />
      <line
        x1={leftMidshipX}
        y1={midshipY}
        x2={rightMidshipX}
        y2={midshipY}
        className={`diagram__guide${selectedElement === "midship" ? " diagram__guide--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("midship");
        }}
      />
      <line
        x1={leftTransomX}
        y1={sternY}
        x2={rightTransomX}
        y2={sternY}
        className={`diagram__guide${selectedElement === "transom" ? " diagram__guide--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("transom");
        }}
      />
      <line
        x1={MAST.x}
        y1={Math.min(MAST.y, midshipY)}
        x2={MAST.x}
        y2={Math.max(MAST.y, midshipY)}
        className={`diagram__offset${selectedElement === "mastOffset" ? " diagram__offset--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("mastOffset");
        }}
      />

      <path
        d={sailPath}
        className={`diagram__sail${selectedElement === "sail" ? " diagram__sail--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("sail");
        }}
      />
      <line
        x1={pointA.x}
        y1={pointA.y}
        x2={pointB.x}
        y2={pointB.y}
        className={`diagram__boom${selectedElement === "boom" ? " diagram__boom--active" : ""}`}
      />
      <line
        x1={pointA.x}
        y1={pointA.y}
        x2={pointB.x}
        y2={pointB.y}
        className="diagram__hit-area"
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("boom");
        }}
      />

      <line
        x1={pointCBase.x}
        y1={pointCBase.y}
        x2={pointC.x}
        y2={pointC.y}
        className="diagram__depth-guide"
      />

      <circle
        cx={pointA.x}
        cy={pointA.y}
        r="10"
        className={`diagram__mast${selectedElement === "pointA" ? " diagram__mast--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("pointA");
        }}
      />
      <circle
        cx={pointB.x}
        cy={pointB.y}
        r="7"
        className={`diagram__point diagram__point--end${selectedElement === "pointB" ? " diagram__point--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("pointB");
        }}
      />
      <circle
        cx={pointC.x}
        cy={pointC.y}
        r="7"
        className={`diagram__point diagram__point--control${selectedElement === "pointC" ? " diagram__point--active" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedElement("pointC");
        }}
      />

      {activeLabel ? (
        <g className="diagram__annotation" pointerEvents="none">
          <text x={activeLabel.x} y={activeLabel.y} className="diagram__label">
            {activeLabel.title}
          </text>
          <text
            x={activeLabel.x}
            y={activeLabel.y + 20}
            className="diagram__note"
          >
            {activeLabel.description}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
