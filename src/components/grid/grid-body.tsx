import React, { ReactChild } from "react";
import { Task } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
  // onScrollToToday?: boolean;
  todayRef: React.RefObject<SVGRectElement>;
  // ganttRef: React.RefObject<HTMLDivElement>;
  // onTodayXCalculated?: (todayX:number|null) => void;
};

export const GridBody: React.FC<GridBodyProps> = ({
                                                    tasks,
                                                    dates,
                                                    rowHeight,
                                                    svgWidth,
                                                    columnWidth,
                                                    todayColor,
                                                    rtl,
                                                    todayRef,
                                                  }) => {


  let y = 0;
  const gridRows: ReactChild[] = [];
  const rowLines: ReactChild[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    gridRows.push(
      <rect
        key={"Row" + task.id}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={styles.gridRow}
      />,
    );
    rowLines.push(
      <line
        key={"RowLine" + task.id}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />,
    );
    y += rowHeight;
  }

  const now = new Date();
  const currentHour = now.getHours(); // 현재 시간을 시간 단위로 추출
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />,
    );



    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond",
        ).getTime() >= now.getTime())
    ) {
      // 현재 날짜가 오늘이라면
      if (now.toDateString() === date.toDateString()) {
        let relativePosition = 0;

        // 시간대별로 상대적인 위치를 계산
        if (currentHour < 6) {
          relativePosition = 0; // 0시~6시는 맨 앞 (좌측)
        } else if (currentHour >= 6 && currentHour < 12) {
          relativePosition = columnWidth * (1 / 3); // 6시~12시는 3분의 1 지점
        } else if (currentHour >= 12 && currentHour < 18) {
          relativePosition = columnWidth * (2 / 3); // 12시~18시는 3분의 2 지점
        } else if (currentHour >= 18 && currentHour <= 24) {
          relativePosition = columnWidth * (2.5 / 3); // 18시~24시는 거의 3분의 2.8 지점
        }

        today = (
          <rect
            x={tickX + relativePosition}
            y={0}
            width={2} // 선처럼 보이게 하려면 width 값을 작게
            height={y} // 전체 높이를 차지하게
            fill={todayColor} // 어두운 색상 적용
            ref={todayRef}
          />
        );
      }

      //setSrollX 를 이곳에 선언!

    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
          ref={todayRef}
        />
      );
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};
