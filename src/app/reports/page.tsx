'use client';

import { motion } from 'framer-motion';
import { Card3D, GlassPanel, GlassButton } from '@/components/ui';
import { FileText, Download, BarChart3, Cable, Settings, Layers, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const reports = [
    {
      title: 'Wiring Harness Connectivity',
      description: 'Complete trace list of all wire endpoints, signal codes, and connector pin assignments.',
      metric: '19,016 Wires',
      icon: Cable,
      color: 'cyan',
      href: '/wires'
    },
    {
      title: 'Trainlines Master List',
      description: 'Physical control loop lines mapping 110V DC signals and zero-speed loops.',
      metric: '978 Lines',
      icon: Layers,
      color: 'purple',
      href: '/trainlines'
    },
    {
      title: 'Equipment Device Log',
      description: 'Physical equipment nodes, cabinet locations, and active control cabinets.',
      metric: '264 Devices',
      icon: Settings,
      color: 'indigo',
      href: '/equipment'
    },
    {
      title: 'Drawing Index & PDF Mapping',
      description: 'List of all system schematics, revision numbers, and mapped PDF pages.',
      metric: '574 Drawings',
      icon: FileText,
      color: 'blue',
      href: '/drawings'
    }
  ];

  return (
    <div className="space-y-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          System Reports
        </h1>
        <p className="text-slate-400 text-lg">
          Generate and download operational reports for the vehicle control system.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card3D glowColor={report.color as any} variant="elevated" className="border-slate-800">
              <div className="p-6 flex flex-col justify-between h-full space-y-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${report.color}-500/10 text-${report.color}-400`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-semibold">Volume</span>
                    <span className="text-lg font-bold text-white">{report.metric}</span>
                  </div>
                  
                  <Link href={report.href}>
                    <GlassButton variant="primary" size="sm" className="gap-1">
                      Explore <ArrowUpRight className="h-4 w-4" />
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
