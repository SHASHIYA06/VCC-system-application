import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Lightbulb, Link2, AlertTriangle, Gauge, Cpu, Box, ZapOff,
} from 'lucide-react';

/**
 * System explorer.
 *
 * This page is now driven by the System table. Previously a 16-entry
 * `ALL_SYSTEMS` constant was the source of truth: the DB merge spread `...s`
 * first and only overrode `id`/`drawing_count`/`deviceCount`, so every name and
 * description on screen came from the constant and the real ones were discarded.
 * Trainline counts were hardcoded per system (52, 10, 10, 12, 6, 8, 5) and were
 * what fed both the header total and each card's "N TL" badge — nothing about
 * that number came from the database.
 *
 * Real DB systems that were missing from the constant were pushed with
 * `category: 'Other'`, which `categoryOrder` did not contain, so they were
 * counted in the header but never rendered.
 *
 * The constant below survives only as presentation metadata (icon + category
 * grouping). It never supplies a name, description or count.
 */
interface SystemRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  iconName: string;
  sortOrder: number;
  drawingCount: number;
  deviceCount: number;
  subsystemCount: number;
  trainlineCount: number;
}

/** Icon + category per known system code. Presentation only. */
const SYSTEM_PRESENTATION: Record<string, { icon: string; category: string }> = {
  GEN: { icon: 'Settings', category: 'Foundation' },
  TRL: { icon: 'Train', category: 'Core' },
  CAB: { icon: 'Cpu', category: 'Core' },
  TRAC: { icon: 'Zap', category: 'Propulsion' },
  BRAKE: { icon: 'ShieldCheck', category: 'Core' },
  APS: { icon: 'Battery', category: 'Power' },
  DOOR: { icon: 'DoorOpen', category: 'Core' },
  VAC: { icon: 'Wind', category: 'Core' },
  TMS: { icon: 'Activity', category: 'Control' },
  TCMS: { icon: 'Activity', category: 'Control' },
  COMMS: { icon: 'Radio', category: 'Control' },
  LIGHT: { icon: 'Lightbulb', category: 'Power' },
  COUPL: { icon: 'Link2', category: 'Core' },
  COUPLING: { icon: 'Link2', category: 'Core' },
  LTEB: { icon: 'Box', category: 'Power' },
  LTJB: { icon: 'Box', category: 'Power' },
  EDB: { icon: 'Box', category: 'Power' },
  HV: { icon: 'ZapOff', category: 'Power' },
  BOGIE: { icon: 'Gauge', category: 'Propulsion' },
  CCTV: { icon: 'Radio', category: 'Control' },
  PIS: { icon: 'Radio', category: 'Control' },
  BECU: { icon: 'ShieldCheck', category: 'Core' },
  AUX: { icon: 'Battery', category: 'Power' },
  DISPLAY: { icon: 'Activity', category: 'Control' },
  TFT: { icon: 'Activity', category: 'Control' },
  PEAU: { icon: 'AlertTriangle', category: 'Core' },
  FIRE: { icon: 'AlertTriangle', category: 'Core' },
  BATT: { icon: 'Battery', category: 'Power' },
  SIV: { icon: 'Zap', category: 'Power' },
  AAU: { icon: 'Wind', category: 'Core' },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Lightbulb, Link2, Gauge, Cpu, Box, ZapOff, AlertTriangle,
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Foundation: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: 'text-slate-400' },
  Core: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  Propulsion: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  Power: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  Control: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  Other: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', icon: 'text-violet-400' },
};

// 'Other' is included so a system whose code is not in SYSTEM_PRESENTATION still
// renders instead of being counted-but-hidden.
const CATEGORY_ORDER = ['Foundation', 'Core', 'Propulsion', 'Power', 'Control', 'Other'];

export default async function SystemsPage() {
  let systems: SystemRow[] = [];
  let loadError: string | null = null;

  try {
    // Trainlines hang off Drawing, not System, so their per-system count needs a
    // join rather than a `_count` on System.
    const [dbSystems, trainlineGroups] = await Promise.all([
      prisma.system.findMany({
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        include: {
          _count: { select: { drawings: true, devices: true, subsystems: true } },
        },
      }),
      prisma.$queryRaw<Array<{ code: string; cnt: bigint }>>`
        SELECT s."code", COUNT(tl.id) AS cnt
        FROM "System" s
        JOIN "Drawing" d ON d."systemId" = s.id
        JOIN "TrainLine" tl ON tl."drawingId" = d.id
        GROUP BY s."code"`,
      ]);

    const trainlineByCode = new Map(trainlineGroups.map(t => [t.code, Number(t.cnt)]));

    systems = dbSystems.map(db => {
      const presentation = SYSTEM_PRESENTATION[db.code];
      return {
        id: db.id,
        code: db.code,
        name: db.name,
        description: db.description,
        category: db.category || presentation?.category || 'Other',
        iconName: presentation?.icon ?? 'Settings',
        sortOrder: db.sortOrder ?? 99,
        drawingCount: db._count.drawings,
        deviceCount: db._count.devices,
        subsystemCount: db._count.subsystems,
        trainlineCount: trainlineByCode.get(db.code) ?? 0,
      };
    });
  } catch (e) {
    // Previously this only logged, so a DB failure silently rendered 16
    // hardcoded systems as though they were live data.
    console.error('Failed to fetch systems from DB', e);
    loadError = e instanceof Error ? e.message : 'Unknown database error';
  }

  const grouped = systems.reduce((acc, sys) => {
    const cat = CATEGORY_ORDER.includes(sys.category) ? sys.category : 'Other';
    (acc[cat] ??= []).push(sys);
    return acc;
  }, {} as Record<string, SystemRow[]>);

  const totalTrainlines = systems.reduce((sum, s) => sum + s.trainlineCount, 0);
  const totalDevices = systems.reduce((sum, s) => sum + s.deviceCount, 0);
  const totalDrawings = systems.reduce((sum, s) => sum + s.drawingCount, 0);
  const emptySystems = systems.filter(
    s => s.drawingCount === 0 && s.deviceCount === 0 && s.trainlineCount === 0,
  );

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold gradient-text">
          <Activity className="h-8 w-8 text-cyan-400" aria-hidden="true" />
          System Explorer
        </h1>
        <p className="mt-2 text-slate-400">
          Browse all VCC systems with their drawings, equipment and trainlines
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="tabular-nums">{systems.length} Systems</span>
          <span className="flex items-center gap-1 tabular-nums">
            <Settings className="h-4 w-4" aria-hidden="true" />
            {totalDrawings} Drawings
          </span>
          <span className="flex items-center gap-1 tabular-nums">
            <Train className="h-4 w-4" aria-hidden="true" />
            {totalTrainlines} Trainlines
          </span>
          <span className="flex items-center gap-1 tabular-nums">
            <Box className="h-4 w-4" aria-hidden="true" />
            {totalDevices} Equipment
          </span>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-300">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Could not load systems from the database
          </p>
          <p className="mt-1 text-sm text-red-300/80">{loadError}</p>
        </div>
      )}

      {/* Systems with nothing attached are called out rather than silently
          appearing as normal, explorable systems that then turn up empty. */}
      {emptySystems.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {emptySystems.length} system{emptySystems.length === 1 ? '' : 's'} have no drawings,
            equipment or trainlines yet
          </p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {emptySystems.map(s => s.code).join(', ')}
          </p>
        </div>
      )}

      {systems.length === 0 && !loadError && (
        <div className="glass-card p-12 text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 text-slate-500" aria-hidden="true" />
          <p className="text-slate-400">No systems recorded in the database</p>
        </div>
      )}

      {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(category => {
        const catColors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Core;
        const catSystems = grouped[category];

        return (
          <div key={category} className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h2 className={`text-lg font-semibold ${catColors.text}`}>{category} Systems</h2>
              <div className="h-px flex-1 bg-slate-700/50" />
              <span className="text-xs text-slate-600 tabular-nums">
                {catSystems.length} systems
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catSystems.map(system => {
                const IconComponent = iconMap[system.iconName] ?? Settings;
                const isEmpty =
                  system.drawingCount === 0 &&
                  system.deviceCount === 0 &&
                  system.trainlineCount === 0;

                return (
                  <Link
                    key={system.code}
                    href={`/systems/${system.code}`}
                    className="group block cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    <div className="glass-card h-full p-5 transition-colors duration-200 hover:border-cyan-500/40">
                      <div className="flex items-start justify-between">
                        <div className={`rounded-lg border p-2.5 ${catColors.bg} ${catColors.border}`}>
                          <IconComponent className={`h-5 w-5 ${catColors.icon}`} />
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {system.drawingCount > 0 && (
                            <span className="inline-flex items-center rounded bg-slate-700/50 px-1.5 py-0.5 text-xs font-medium text-slate-400 tabular-nums">
                              {system.drawingCount} DWG
                            </span>
                          )}
                          {system.trainlineCount > 0 && (
                            <span className="inline-flex items-center rounded bg-slate-700/50 px-1.5 py-0.5 text-xs font-medium text-slate-400 tabular-nums">
                              {system.trainlineCount} TL
                            </span>
                          )}
                          {system.deviceCount > 0 && (
                            <span className="inline-flex items-center rounded bg-slate-700/50 px-1.5 py-0.5 text-xs font-medium text-slate-400 tabular-nums">
                              {system.deviceCount} EQ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-cyan-400">
                          {system.code}
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-slate-400">{system.name}</p>
                        {system.description ? (
                          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                            {system.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs italic text-slate-600">
                            No description recorded
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3 text-xs font-medium">
                        <span className="text-cyan-400 transition-colors duration-200 group-hover:text-cyan-300">
                          Explore System →
                        </span>
                        {isEmpty && <span className="text-amber-500/80">No data yet</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
