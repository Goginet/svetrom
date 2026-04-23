export type CourseName =
  | "Левентик"
  | "Бейдевинд"
  | "Галфвинд"
  | "Бакштаг"
  | "Фордевинд";

export type CourseInfo = {
  name: CourseName;
  description: string;
  accent: string;
};

const normalizeAngle = (angle: number): number => {
  const normalized = angle % 360;
  return normalized >= 0 ? normalized : normalized + 360;
};

export const getSignedAngleDifference = (
  fromAngle: number,
  toAngle: number,
): number => {
  const difference = normalizeAngle(toAngle) - normalizeAngle(fromAngle);

  if (difference > 180) {
    return difference - 360;
  }

  if (difference < -180) {
    return difference + 360;
  }

  return difference;
};

export const getApparentWindAngle = (
  boatHeading: number,
  windSourceAngle: number,
): number => Math.abs(getSignedAngleDifference(boatHeading, windSourceAngle));

export const getCourseInfo = (apparentWindAngle: number): CourseInfo => {
  if (apparentWindAngle < 35) {
    return {
      name: "Левентик",
      description: "Яхта идет слишком круто к ветру и теряет тягу.",
      accent: "#ef4444",
    };
  }

  if (apparentWindAngle < 60) {
    return {
      name: "Бейдевинд",
      description: "Острый курс к ветру с сильно подтянутыми парусами.",
      accent: "#f97316",
    };
  }

  if (apparentWindAngle < 120) {
    return {
      name: "Галфвинд",
      description: "Самый ровный и комфортный курс при боковом ветре.",
      accent: "#0ea5e9",
    };
  }

  if (apparentWindAngle < 160) {
    return {
      name: "Бакштаг",
      description: "Полный курс с ветром в кормовую четверть.",
      accent: "#22c55e",
    };
  }

  return {
    name: "Фордевинд",
    description: "Ветер дует почти строго в корму.",
    accent: "#8b5cf6",
  };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getSailAngles = (
  boatHeading: number,
  windSourceAngle: number,
): { main: number; jib: number } => {
  const signedWindAngle = getSignedAngleDifference(boatHeading, windSourceAngle);
  const apparentWindAngle = Math.abs(signedWindAngle);
  const openness = clamp((apparentWindAngle - 20) / 160, 0, 1);
  const side = signedWindAngle >= 0 ? -1 : 1;

  return {
    main: side * (8 + openness * 62),
    jib: side * (12 + openness * 73),
  };
};
