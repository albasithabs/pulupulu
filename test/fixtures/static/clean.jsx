import { useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';

// Order summary card — kept flat on purpose, no nested cards.
const STOPS = [
  { id: 'kd', name: 'Kedai Kopi Ujung', time: '07:30', note: 'Pickup by the side door' },
  { id: 'ps', name: 'Pasar Senen stall 14', time: '08:15', note: 'Ask for Bu Rina' },
];

export default function DeliveryRoute({ driver, onConfirm }) {
  const [open, setOpen] = useState(false);
  const count = STOPS.length;
  const title = `Route for ${driver.name} — today`;

  return (
    <section className="mx-auto max-w-2xl bg-white px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">Tuesday route</h1>
      <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {count} stops, starting at the depot on Jalan Kramat. Confirm each stop when the parcel is in the customer's hands.
      </p>
      <ol className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {STOPS.map((stop) => (
          <li key={stop.id} className="flex items-start gap-3 py-4">
            <MapPin aria-hidden="true" className="mt-1 h-4 w-4 text-slate-500" />
            <div>
              <h2 className="text-lg font-medium">{stop.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <CalendarDays aria-hidden="true" className="mr-1 inline h-4 w-4" />
                {stop.time} · {stop.note}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => onConfirm(title)}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Confirm all stops
        </button>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-md border border-slate-300 px-4 py-2 text-slate-800">
          {open ? 'Hide map' : 'Show map'}
        </button>
      </div>
      {open && <img src="/maps/route-tuesday.png" alt="Map of the Tuesday route from the depot to Pasar Senen" className="mt-6 rounded-md" />}
      <aside className="mt-8 border-l-2 border-slate-200 pl-4 text-sm text-slate-600">
        Parcels marked fragile ride in the front seat.
      </aside>
      <p className="mt-8 text-xs text-slate-600">Updated by dispatch at 06:55.</p>
    </section>
  );
}
