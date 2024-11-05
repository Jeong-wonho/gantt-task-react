import { Task, ViewMode } from "../types/public-types";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateTimeFormat = Intl.DateTimeFormat;

type DateHelperScales =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

const intlDTCache = {};
export const getCachedDateTimeFormat = (
  locString: string | string[],
  opts: DateTimeFormatOptions = {}
): DateTimeFormat => {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
};

/**
 * 날짜를 더 하는 함수.
 * @param date 기준이 되는 Date 객체.
 * @param quantity 더할 양. 양수일 경우 앞으로(미래로) 더하고, 음수일 경우 뒤로(과거로) 뺍니다.
 * @param scale 더할 단위(년, 월, 일 등). scale에 따라 더해질 양이 달라집니다.
 */
export const addToDate = (
  date: Date,
  quantity: number,
  scale: DateHelperScales
) => {
  const newDate = new Date(
    // 기준 날짜의 연도를 가져와서, scale이 "year"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 연도 그대로 유지.
    date.getFullYear() + (scale === "year" ? quantity : 0),
    // 기준 날짜의 월을 가져와서, scale이 "month"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 월 그대로 유지. (0부터 11까지, 0이 1월을 의미함)
    date.getMonth() + (scale === "month" ? quantity : 0),
    // 기준 날짜의 일을 가져와서, scale이 "day"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 일을 그대로 유지.
    date.getDate() + (scale === "day" ? quantity : 0),
    // 기준 날짜의 시(hour)를 가져와서, scale이 "hour"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 시를 그대로 유지.
    date.getHours() + (scale === "hour" ? quantity : 0),
    // 기준 날짜의 분(minutes)을 가져와서, scale이 "minute"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 분을 그대로 유지.
    date.getMinutes() + (scale === "minute" ? quantity : 0),
    // 기준 날짜의 초(seconds)를 가져와서, scale이 "second"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 초를 그대로 유지.
    date.getSeconds() + (scale === "second" ? quantity : 0),
    // 기준 날짜의 밀리초(milliseconds)를 가져와서, scale이 "millisecond"인 경우 quantity 만큼 더한 값을 사용.
    // 그렇지 않으면 현재 밀리초를 그대로 유지.
    date.getMilliseconds() + (scale === "millisecond" ? quantity : 0)
  );
  return newDate;
};

/**
 * 주어진 날짜를 특정 시간 단위까지 초기화하는 함수.
 * @param date 초기화할 기준이 되는 Date 객체.
 * @param scale 초기화할 시간 단위(년, 월, 일 등). 이 scale보다 작은 단위는 모두 초기화됩니다.
 */
export const startOfDate = (date: Date, scale: DateHelperScales) => {
  // 시간 단위별 초기화 우선순위를 배열로 정의. "millisecond"부터 "year" 순으로 나열되어 있음.
  const scores = [
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "year",
  ];

  // 주어진 시간 단위(_scale)가 초기화 대상인지 판별하는 함수
  const shouldReset = (_scale: DateHelperScales) => {
    // 주어진 scale에 해당하는 위치 인덱스보다 작은 항목들은 초기화 대상으로 간주
    const maxScore = scores.indexOf(scale); // 주어진 scale의 인덱스
    return scores.indexOf(_scale) <= maxScore; // 주어진 scale보다 작은 단위는 초기화
  };

  // 특정 scale 이하의 시간 단위를 초기화하여 새로운 Date 객체 생성
  const newDate = new Date(
    date.getFullYear(),                              // 연도는 그대로 유지
    shouldReset("year") ? 0 : date.getMonth(),       // scale이 "year" 이하일 경우 월을 0(1월)으로 초기화
    shouldReset("month") ? 1 : date.getDate(),       // scale이 "month" 이하일 경우 일을 1로 초기화
    shouldReset("day") ? 0 : date.getHours(),        // scale이 "day" 이하일 경우 시간을 0으로 초기화
    shouldReset("hour") ? 0 : date.getMinutes(),     // scale이 "hour" 이하일 경우 분을 0으로 초기화
    shouldReset("minute") ? 0 : date.getSeconds(),   // scale이 "minute" 이하일 경우 초를 0으로 초기화
    shouldReset("second") ? 0 : date.getMilliseconds() // scale이 "second" 이하일 경우 밀리초를 0으로 초기화
  );

  return newDate; // 초기화된 새로운 Date 객체 반환
};

/**
 * Gantt 차트의 날짜 범위를 계산하는 함수.
 * 주어진 tasks 배열을 기반으로 가장 이른 시작일과 가장 늦은 종료일을 찾고,
 * viewMode에 따라 해당 범위를 확장하여 Gantt 차트에 표시할 전체 날짜 범위를 반환합니다.
 *
 * @param tasks - Gantt 차트에 표시될 작업(Task) 배열
 * @param viewMode - Gantt 차트의 보기 모드 (Year, QuarterYear, Month, Week, Day, QuarterDay, HalfDay, Hour)
 * @param preStepsCount - 추가로 확장할 날짜의 수 (예: preStepsCount가 1일 경우 이전 날짜를 1단계 추가로 표시)
 * @returns [newStartDate, newEndDate] - 계산된 시작 및 종료 날짜
 */
export const ganttDateRange = (
  tasks: Task[],
  viewMode: ViewMode,
  preStepsCount: number
) => {
  // 가장 이른 시작 날짜와 가장 늦은 종료 날짜를 찾음
  let newStartDate: Date = tasks[0].start;
  let newEndDate: Date = tasks[0].start;
  for (const task of tasks) {
    if (task.start < newStartDate) {
      newStartDate = task.start;
    }
    if (task.end > newEndDate) {
      newEndDate = task.end;
    }
  }
  // viewMode에 따라 시작 날짜와 종료 날짜 확장
  switch (viewMode) {
    case ViewMode.Year:
      // 연 단위로 1년 이전과 1년 이후로 확장
      newStartDate = addToDate(newStartDate, -1, "year");
      newStartDate = startOfDate(newStartDate, "year");
      newEndDate = addToDate(newEndDate, 1, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;
    case ViewMode.QuarterYear:
      // 분기 단위로 3개월 이전과 3개월 이후로 확장
      newStartDate = addToDate(newStartDate, -3, "month");
      newStartDate = startOfDate(newStartDate, "month");
      newEndDate = addToDate(newEndDate, 3, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;
    case ViewMode.Month:
      // 월 단위로 preStepsCount 개월 이전과 1년 이후로 확장
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "month");
      newStartDate = startOfDate(newStartDate, "month");
      newEndDate = addToDate(newEndDate, 1, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;
    case ViewMode.Week:
      // 주 단위로 preStepsCount 주 이전과 1.5개월 이후로 확장
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(getMonday(newStartDate), -7 * preStepsCount, "day"); // 주의 시작 (월요일)로 설정 후 확장
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 1.5, "month");
      break;
    case ViewMode.Day:
      // 일 단위로 preStepsCount 일 이전과 19일 이후로 확장
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 19, "day");
      break;
    case ViewMode.QuarterDay:
      // 6시간 단위로 preStepsCount 일 이전과 66시간 이후로 확장
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 66, "hour"); // 3일 - 6시간
      break;
    case ViewMode.HalfDay:
      // 12시간 단위로 preStepsCount 일 이전과 108시간 이후로 확장
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 108, "hour"); // 5일 - 12시간
      break;
    case ViewMode.Hour:
      // 시간 단위로 preStepsCount 시간 이전과 1일 이후로 확장
      newStartDate = startOfDate(newStartDate, "hour");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "hour");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 1, "day");
      break;
  }
  return [newStartDate, newEndDate];
};

/**
 * Gantt 차트에 표시할 날짜 배열을 생성하는 함수.
 * 주어진 startDate에서 endDate까지 viewMode에 따라 간격을 두고 날짜를 생성합니다.
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @param viewMode - Gantt 차트의 보기 모드 (Year, QuarterYear, Month, Week, Day, QuarterDay, HalfDay, Hour)
 * @returns dates - 생성된 날짜 배열
 */
export const seedDates = (
  startDate: Date,
  endDate: Date,
  viewMode: ViewMode
) => {
  let currentDate: Date = new Date(startDate); // 시작 날짜를 기준으로 현재 날짜 초기화
  const dates: Date[] = [currentDate]; // 결과 날짜 배열에 시작 날짜 추가

  // currentDate가 endDate에 도달할 때까지 반복하여 날짜를 추가
  while (currentDate < endDate) {
    switch (viewMode) {
      case ViewMode.Year:
        currentDate = addToDate(currentDate, 1, "year");
        break;
      case ViewMode.QuarterYear:
        currentDate = addToDate(currentDate, 3, "month");
        break;
      case ViewMode.Month:
        currentDate = addToDate(currentDate, 1, "month");
        break;
      case ViewMode.Week:
        currentDate = addToDate(currentDate, 7, "day");
        break;
      case ViewMode.Day:
        currentDate = addToDate(currentDate, 1, "day");
        break;
      case ViewMode.HalfDay:
        currentDate = addToDate(currentDate, 12, "hour");
        break;
      case ViewMode.QuarterDay:
        currentDate = addToDate(currentDate, 6, "hour");
        break;
      case ViewMode.Hour:
        currentDate = addToDate(currentDate, 1, "hour");
        break;
    }
    dates.push(currentDate);
  }
  return dates;
};

export const getLocaleMonth = (date: Date, locale: string) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    month: "long",
  }).format(date);
  bottomValue = bottomValue.replace(
    bottomValue[0],
    bottomValue[0].toLocaleUpperCase()
  );
  return bottomValue;
};

export const getLocalDayOfWeek = (
  date: Date,
  locale: string,
  format?: "long" | "short" | "narrow" | undefined
) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    weekday: format,
  }).format(date);
  bottomValue = bottomValue.replace(
    bottomValue[0],
    bottomValue[0].toLocaleUpperCase()
  );
  return bottomValue;
};

/**
 * Returns monday of current week
 * @param date date for modify
 */
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const getWeekNumberISO8601 = (date: Date) => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (
    1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)
  ).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
