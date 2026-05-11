import Link from 'next/link';
import {
  BookOpen, Zap, ShieldCheck, DoorOpen, Wind, Activity, Cpu, AlertTriangle,
  ChevronRight, ArrowRight, CheckCircle, Play, Eye, FileText
} from 'lucide-react';

const LEARNING_MODULES = [
  {
    id: 'intro-vcc',
    title: 'Understanding VCC Documents',
    category: 'Foundation',
    difficulty: 'beginner',
    duration: '10 min',
    description: 'Learn how to read Vehicle Control Circuit drawings, understand drawing numbers, and navigate the document structure.',
    lessons: [
      { title: 'What is VCC?', content: 'VCC (Vehicle Control Circuit) documents define all electrical wiring, control signals, and interconnections for the train. They are the single source of truth for all electrical systems.' },
      { title: 'Drawing Number Structure', content: 'Drawing numbers like 942-58103 follow a format. The 942-58xxx range indicates VCC schematics, while 942-38xxx indicates PIN assignment drawings.' },
      { title: 'Reading Wire Numbers', content: 'Wire numbers are 5-digit codes: positions 1-2 indicate unit/device, position 3 indicates car type (1=DMC, 2=TC, 3=MC), position 4 indicates trainline type, position 5 is serial number.' },
    ],
    related_drawings: ['942-58099', '942-58100', '942-58101'],
  },
  {
    id: 'fleet-formation',
    title: 'Fleet Formation & Car Types',
    category: 'Foundation',
    difficulty: 'beginner',
    duration: '8 min',
    description: 'Understand the 6-car formation: DMC-TC-MC-MC-TC-DMC, and the role of each car type in the train.',
    lessons: [
      { title: 'DMC - Driving Motor Car', content: 'DMC has a cab with operating controls, VVVF inverter, pantograph (optional on leading DMC), BCU. There are two DMC cars per formation at positions 1 and 6.' },
      { title: 'TC - Trailer Car', content: 'TC has auxiliary power supply (APS), battery, TCMS RIO unit, BECU for brake control. There are two TC cars at positions 2 and 5.' },
      { title: 'MC - Motor Car', content: 'MC has VVVF inverter, TCMS RIO, DCU for door control, VAC units, BECU. There are two MC cars at positions 3 and 4.' },
      { title: 'Inter-car Jumpers', content: 'X1 (74P) carries control signals, X2 (74PW) carries control + power, X3 (11P) carries 415V AC, X4 (3P) carries 110V DC across all cars.' },
    ],
    related_drawings: ['942-38409', '942-38509', '942-38609'],
  },
  {
    id: 'door-system',
    title: 'Door System Operations',
    category: 'Door',
    difficulty: 'intermediate',
    duration: '15 min',
    description: 'Master left/right door open/close commands, proving loops, zero speed interlock, and cross-connections.',
    lessons: [
      { title: 'Door Command Trainlines', content: 'Left door open: 6009, Left door close: 6014, Right door open: 6046, Right door close: 6051. All from TCMS RIO to DCU.' },
      { title: 'Cross-Connection at Jumpers', content: 'IMPORTANT: 6009 and 6046 are crossed at jumper positions 43-44. Similarly 6014 and 6051 cross at 46-47. This enables single-button all-door operation.' },
      { title: 'Zero Speed Interlock', content: 'Trainline 6112 (zero speed) must be active for doors to open. This prevents door opening while train is in motion.' },
      { title: 'Door Proving Loops', content: 'Trainlines 6073 and 6076 provide door position feedback to TCMS. If obstruction detected, doors reverse.' },
    ],
    related_drawings: ['942-58137', '942-58138', '942-58139', '942-58140'],
  },
  {
    id: 'brake-system',
    title: 'Brake System Architecture',
    category: 'Brake',
    difficulty: 'advanced',
    duration: '20 min',
    description: 'Deep dive into brake loops, emergency brake circuits, parking brake, and BCU/BECU architecture.',
    lessons: [
      { title: 'Brake Loop Normal', content: 'Trainline 4024 (brake loop normal) and 4028 (brake loop return) run through BCU/BECU across all cars. Commands brake application.' },
      { title: 'Emergency Brake Loop', content: 'Trainlines 4062/4070 (normal) and 4103/4110 (redundant) form two independent EM brake loops. Either loop can command emergency brake.' },
      { title: 'Parking Brake', content: 'Trainline 4122 = parking brake applied, 4153 = parking brake released. Only DMC and MC cars have parking brake actuators (PBMV).' },
      { title: 'BCU vs BECU', content: 'BCU (Brake Control Unit) is on DMC/MC cars with full brake logic. BECU (Brake Electronic Control Unit) is on TC cars as passive brake controller.' },
    ],
    related_drawings: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58128', '942-58129'],
  },
  {
    id: 'traction-control',
    title: 'Traction & Propulsion Control',
    category: 'Traction',
    difficulty: 'advanced',
    duration: '15 min',
    description: 'Understand propulsion commands, VVVF inverter interface, and the critical 3005/3006 cross-connection.',
    lessons: [
      { title: 'Propulsion Trainlines', content: '3003 = Forward, 3004 = Reverse, 3005 = Powering 1, 3006 = Powering 2, 3010 = Braking. All from TCMS to VVVF via CN1.' },
      { title: 'CRITICAL: X1 Cross-Connection', content: 'Trainlines 3005 and 3006 are CROSSED at X1 pins 19/20. This creates a differential signal for powering. If reversed, train will creep unexpectedly.' },
      { title: 'VVVF Interface', content: 'VVVF CN1 connector carries propulsion commands. CN2 carries mode/status signals. PWM command varies inverter frequency.' },
      { title: 'Speed Control', content: 'TCMS sends forward/reverse and power level commands. VVVF converts DC link voltage to variable frequency AC for traction motors.' },
    ],
    related_drawings: ['942-58119', '942-58120', '942-58121'],
  },
  {
    id: 'tcms-overview',
    title: 'TCMS Architecture',
    category: 'TCMS',
    difficulty: 'intermediate',
    duration: '12 min',
    description: 'Learn about TCMS RIO units, digital I/O mapping, and how TCMS interfaces with all subsystems.',
    lessons: [
      { title: 'TCMS RIO Units', content: 'MC cars have TCMS_RIO1 (U15), TC cars have TCMS_RIO2 (U25). Each RIO has multiple connectors with digital inputs and outputs.' },
      { title: 'Digital I/O Mapping', content: 'Each RIO point has a code like U15-J7. This maps to a specific connector pin and signal. Example: U15-J7 = DOOR_OPEN_LEFT output.' },
      { title: 'Trainline Integration', content: 'TCMS commands are broadcast via trainlines. The same trainline may connect to multiple cars and equipment.' },
      { title: 'Drawing 942-58146', content: 'TMS Interface sheets 1-4 show all TCMS-to-subsystem connections including RIO pin assignments.' },
    ],
    related_drawings: ['942-58146'],
  },
  {
    id: 'cross-connections',
    title: 'Critical Cross-Connections',
    category: 'Troubleshooting',
    difficulty: 'advanced',
    duration: '10 min',
    description: 'Identify and understand all cross-connections that can cause unexpected behavior if miswired.',
    lessons: [
      { title: 'X1 Pins 19/20: Propulsion', content: '3005 ↔ 3006 crossed. Wires going to pins 19 and 20 on X1 are swapped. Reversing causes creep. Always verify with multimeter.' },
      { title: 'Jumper 43-44: Door Open', content: '6009 ↔ 6046 crossed. Left/right door open commands are swapped at jumpers 43-44. Affects all cars in train.' },
      { title: 'Jumper 46-47: Door Close', content: '6014 ↔ 6051 crossed. Left/right door close commands are swapped at jumpers 46-47.' },
      { title: 'Verification Procedure', content: 'Use continuity test between X1 pins and destination equipment. Compare against drawing 942-58119 for propulsion cross-connections.' },
    ],
    related_drawings: ['942-58103', '942-58119', '942-58137'],
  },
];

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  beginner: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', label: 'Beginner' },
  intermediate: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', label: 'Intermediate' },
  advanced: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', label: 'Advanced' },
};

export default function LearningPage() {
  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Learning Center</h1>
            <p className="mt-1 text-slate-400">
              Interactive tutorials to understand VCC systems, wiring, and troubleshooting
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-slate-500">{LEARNING_MODULES.length} modules</span>
          <span className="text-slate-500">~2 hours of content</span>
        </div>
      </div>

      <div className="space-y-8">
        {LEARNING_MODULES.map((module, moduleIdx) => {
          const diffConfig = DIFFICULTY_CONFIG[module.difficulty];

          return (
            <div key={module.id} className="glass-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-sm font-bold text-cyan-400">
                        {moduleIdx + 1}
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-white">{module.title}</h2>
                        <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-slate-400 bg-slate-700/50">
                      {module.duration}
                    </span>
                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${diffConfig.color} ${diffConfig.bg}`}>
                      {diffConfig.label}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {module.lessons.map((lesson, lessonIdx) => (
                    <div key={lessonIdx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xs text-slate-400">{lessonIdx + 1}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200">{lesson.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-8">
                        {lesson.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Related Drawings:</span>
                      <div className="flex items-center gap-2">
                        {module.related_drawings.map(d => (
                          <Link key={d} href={`/drawings/${d}`} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-medium text-blue-400 hover:bg-blue-500/20 transition-colors">
                            {d}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors">
                      <Play className="h-4 w-4" />
                      Start Module
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Critical Safety Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h3 className="text-sm font-semibold text-red-400 mb-2">HV System (750VDC)</h3>
            <p className="text-xs text-slate-400">
              Never work on high tension circuits without proper isolation. Verify with voltage meter before touching. HSCB must be opened and grounded.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">Cross-Connection Errors</h3>
            <p className="text-xs text-slate-400">
              Incorrect wiring at crossed trainlines (X1-19/20, Jumpers 43-47) can cause unintended train movement or door operation. Always verify.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Door System Safety</h3>
            <p className="text-xs text-slate-400">
              Zero speed signal (6112) must be verified before door operation. Door proving loops must be functional for passenger safety.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Emergency Brake</h3>
            <p className="text-xs text-slate-400">
              EM brake loops are fail-safe. Any wire break will apply emergency brake. Both 4062 and 4103 loops must be verified during maintenance.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          VCC Explorer Learning Center
        </span>
        <span>|</span>
        <span>KMRCL RS3R Metro</span>
      </div>
    </div>
  );
}