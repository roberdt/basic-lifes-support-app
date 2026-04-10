import Head from 'next/head'
import { useMemo, useState } from 'react'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function CalendarPage() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const grid = useMemo(() => {
    const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay()
    const totalDays = daysInMonth(viewYear, viewMonth)

    const cells = []

    for (let i = 0; i < firstDayOffset; i += 1) {
      cells.push({ type: 'empty', key: `empty-${i}` })
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const isToday =
        day === now.getDate() &&
        viewMonth === now.getMonth() &&
        viewYear === now.getFullYear()

      cells.push({
        type: 'day',
        key: `day-${day}`,
        day,
        isToday,
      })
    }

    return cells
  }, [viewMonth, viewYear, now])

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((year) => year - 1)
      return
    }

    setViewMonth((month) => month - 1)
  }

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((year) => year + 1)
      return
    }

    setViewMonth((month) => month + 1)
  }

  return (
    <div className="calendar-page">
      <Head>
        <title>Calendar | Basic Life Support</title>
        <meta
          name="description"
          content="Monthly calendar view for adding day-by-day information."
        />
      </Head>

      <main className="calendar-shell">
        <header className="toolbar">
          <button type="button" className="nav-btn" onClick={goPrevMonth}>
            Prev
          </button>

          <div className="selectors" aria-label="Month and year selectors">
            <select
              className="select"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
            >
              {MONTH_NAMES.map((monthName, index) => (
                <option value={index} key={monthName}>
                  {monthName}
                </option>
              ))}
            </select>

            <select
              className="select"
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
            >
              {Array.from({ length: 101 }, (_, index) => now.getFullYear() - 50 + index).map(
                (year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>

          <button type="button" className="nav-btn" onClick={goNextMonth}>
            Next
          </button>
        </header>

        <section className="calendar-grid" aria-label="Monthly calendar">
          {WEEKDAYS.map((weekday) => (
            <div className="weekday" key={weekday}>
              {weekday}
            </div>
          ))}

          {grid.map((cell) => {
            if (cell.type === 'empty') {
              return <div className="day-card empty" key={cell.key} aria-hidden="true" />
            }

            return (
              <article className={`day-card${cell.isToday ? ' today' : ''}`} key={cell.key}>
                <header className="day-number">{cell.day}</header>
                <div className="day-content" />
              </article>
            )
          })}
        </section>
      </main>

      <style jsx>{`
        .calendar-page {
          min-height: 100vh;
          background: #f3f5f7;
          color: #1d2733;
        }

        .calendar-shell {
          height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 0.75rem;
        }

        .toolbar {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.75rem;
          align-items: center;
          background: #ffffff;
          border: 1px solid #d6dde5;
          border-radius: 10px;
          padding: 0.75rem;
        }

        .selectors {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .select,
        .nav-btn {
          height: 2.5rem;
          border-radius: 8px;
          border: 1px solid #b8c3cf;
          background: #ffffff;
          padding: 0 0.75rem;
          font-size: 0.95rem;
        }

        .nav-btn {
          min-width: 5rem;
          font-weight: 600;
          cursor: pointer;
        }

        .nav-btn:hover {
          background: #eef3f8;
        }

        .calendar-grid {
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          grid-template-rows: auto repeat(6, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .weekday {
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: #556677;
          padding: 0.5rem 0;
        }

        .day-card {
          min-height: 0;
          background: #ffffff;
          border: 1px solid #d6dde5;
          border-radius: 10px;
          padding: 0.5rem;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 0.35rem;
          overflow: hidden;
        }

        .day-card.empty {
          background: transparent;
          border-style: dashed;
          border-color: #d9e1e8;
        }

        .day-card.today {
          border-color: #1f6feb;
          box-shadow: inset 0 0 0 1px #1f6feb;
        }

        .day-number {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .day-content {
          border: 1px dashed #c4ced8;
          border-radius: 8px;
          background: #f9fbfd;
        }

        @media (max-width: 900px) {
          .calendar-shell {
            padding: 0.75rem;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .selectors {
            justify-content: stretch;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .nav-btn {
            width: 100%;
          }

          .calendar-grid {
            gap: 0.35rem;
          }

          .day-card {
            padding: 0.35rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
        }

        body {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

