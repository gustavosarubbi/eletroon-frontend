"use client";
import * as React from "react";

function pad2(n: number) { return n.toString().padStart(2, "0"); }
function toDateString(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }

export function Calendar({ 
  startDate, 
  endDate, 
  onSelect 
}: { 
  startDate?: string; 
  endDate?: string; 
  onSelect: (value: string) => void 
}) {
  const base = startDate ? new Date(startDate + "T00:00:00") : new Date();
  const [year, setYear] = React.useState<number>(base.getFullYear());
  const [month, setMonth] = React.useState<number>(base.getMonth()); // 0-11

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const goPrev = () => {
    const m = month - 1;
    if (m < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth(m);
  };
  const goNext = () => {
    const m = month + 1;
    if (m > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth(m);
  };

  const startDateStr = startDate ?? "";
  const endDateStr = endDate ?? "";

  const weeks: Array<Array<{ day: number | null; dateStr?: string }>> = [];
  let currentDay = 1;
  for (let week = 0; week < 6; week++) {
    const row: Array<{ day: number | null; dateStr?: string }> = [];
    for (let wd = 0; wd < 7; wd++) {
      const isFirstRow = week === 0;
      if ((isFirstRow && wd < firstWeekday) || currentDay > daysInMonth) {
        row.push({ day: null });
      } else {
        const d = new Date(year, month, currentDay);
        row.push({ day: currentDay, dateStr: toDateString(d) });
        currentDay++;
      }
    }
    weeks.push(row);
    if (currentDay > daysInMonth) break;
  }

  const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"]; // Dom..Sab

  return (
    <div className="w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-neutral-300 text-black hover:bg-neutral-100"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <select
            aria-label="Selecionar mês"
            className="h-7 rounded border border-neutral-300 bg-white px-2 text-sm text-black"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {monthNames.map((m, idx) => (
              <option value={idx} key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Selecionar ano"
            className="h-7 rounded border border-neutral-300 bg-white px-2 text-sm text-black"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {years.map((y) => (
              <option value={y} key={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-neutral-300 text-black hover:bg-neutral-100"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[11px] text-black mb-1">
        {weekdayLabels.map((w, index) => (
          <div key={`weekday-${index}`} className="text-center">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((cell, j) => {
              if (cell.day == null) return <div key={`${i}-${j}`} className="h-8" />;
              const isStartDate = cell.dateStr === startDateStr;
              const isEndDate = cell.dateStr === endDateStr;
              const isInRange = startDateStr && endDateStr && 
                cell.dateStr && 
                cell.dateStr >= startDateStr && 
                cell.dateStr <= endDateStr;
              
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  onClick={() => cell.dateStr && onSelect(cell.dateStr)}
                  className={
                    "h-8 rounded text-sm text-black " +
                    (isStartDate || isEndDate
                      ? "bg-neutral-900 text-white hover:bg-neutral-800 font-bold"
                      : isInRange
                      ? "bg-neutral-200 text-black hover:bg-neutral-300 border border-neutral-300"
                      : "hover:bg-neutral-100 border border-neutral-200")
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


