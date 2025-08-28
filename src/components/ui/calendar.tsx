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
    <div className="w-[280px] p-4 rounded-2xl gradient-glass shadow-xl border border-white/20 relative z-popover">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 smooth-transition-fast focus-ring shadow-sm"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <select
            aria-label="Selecionar mês"
            className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 smooth-transition-fast shadow-sm"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {monthNames.map((m, idx) => (
              <option value={idx} key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Selecionar ano"
            className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 smooth-transition-fast shadow-sm"
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
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 smooth-transition-fast focus-ring shadow-sm"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map((w, index) => (
          <div key={`weekday-${index}`} className="text-center text-xs font-bold text-gray-600 py-2">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((cell, j) => {
              if (cell.day == null) return <div key={`${i}-${j}`} className="h-10" />;
              
              const isStartDate = cell.dateStr === startDateStr;
              const isEndDate = cell.dateStr === endDateStr;
              const isInRange = startDateStr && endDateStr && 
                cell.dateStr && 
                cell.dateStr >= startDateStr && 
                cell.dateStr <= endDateStr;
              const isToday = cell.dateStr === toDateString(new Date());
              
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  onClick={() => cell.dateStr && onSelect(cell.dateStr)}
                  className={`
                    h-10 rounded-xl text-sm font-semibold smooth-transition-fast focus-ring shadow-sm
                    ${isStartDate || isEndDate
                      ? "gradient-primary text-white shadow-lg hover:shadow-xl"
                      : isInRange
                      ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 shadow-sm"
                      : isToday
                      ? "bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200 shadow-sm"
                      : "text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    }
                  `}
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


