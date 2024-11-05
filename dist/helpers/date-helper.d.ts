import { Task, ViewMode } from "../types/public-types";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateTimeFormat = Intl.DateTimeFormat;
declare type DateHelperScales = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";
export declare const getCachedDateTimeFormat: (locString: string | string[], opts?: DateTimeFormatOptions) => DateTimeFormat;
/**
 * 날짜를 더 하는 함수.
 * @param date 기준이 되는 Date 객체.
 * @param quantity 더할 양. 양수일 경우 앞으로(미래로) 더하고, 음수일 경우 뒤로(과거로) 뺍니다.
 * @param scale 더할 단위(년, 월, 일 등). scale에 따라 더해질 양이 달라집니다.
 */
export declare const addToDate: (date: Date, quantity: number, scale: DateHelperScales) => Date;
/**
 * 주어진 날짜를 특정 시간 단위까지 초기화하는 함수.
 * @param date 초기화할 기준이 되는 Date 객체.
 * @param scale 초기화할 시간 단위(년, 월, 일 등). 이 scale보다 작은 단위는 모두 초기화됩니다.
 */
export declare const startOfDate: (date: Date, scale: DateHelperScales) => Date;
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
export declare const ganttDateRange: (tasks: Task[], viewMode: ViewMode, preStepsCount: number) => Date[];
/**
 * Gantt 차트에 표시할 날짜 배열을 생성하는 함수.
 * 주어진 startDate에서 endDate까지 viewMode에 따라 간격을 두고 날짜를 생성합니다.
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @param viewMode - Gantt 차트의 보기 모드 (Year, QuarterYear, Month, Week, Day, QuarterDay, HalfDay, Hour)
 * @returns dates - 생성된 날짜 배열
 */
export declare const seedDates: (startDate: Date, endDate: Date, viewMode: ViewMode) => Date[];
export declare const getLocaleMonth: (date: Date, locale: string) => string;
export declare const getLocalDayOfWeek: (date: Date, locale: string, format?: "long" | "short" | "narrow" | undefined) => string;
export declare const getWeekNumberISO8601: (date: Date) => string;
export declare const getDaysInMonth: (month: number, year: number) => number;
export {};
