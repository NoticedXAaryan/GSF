'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, CheckCircle2, ScanLine } from 'lucide-react';
import { Eyebrow, Chip } from '@/components/ui/bento';
import { checkRecentScan } from '@/app/dashboard/actions/check-scan';

interface PassData {
  passId: string;
  qrToken: string;
  issuedAt: number;
}

interface PassCardInteractiveProps {
  pass: PassData | null;
  userName: string;
  userRole: string;
}

type Phase = 'idle' | 'scanning' | 'confirmed';

/**
 * Scannable festival pass.
 *
 * Presented as a ticket: neon header block, QR panel on a light field so
 * cameras read it in either theme, perforation notches, and a stub footer.
 * A scan runs a sweep line, then stamps a confirmation before settling back
 * to the resting card.
 */
export function PassCardInteractive({ pass, userName, userRole }: PassCardInteractiveProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  /** scanning -> confirmed -> idle */
  const runScanSequence = useCallback(() => {
    clearTimers();
    setPhase('scanning');
    timersRef.current.push(
      window.setTimeout(() => setPhase('confirmed'), 1100),
      window.setTimeout(() => setPhase('idle'), 3100)
    );
  }, [clearTimers]);

  useEffect(() => {
    function onScanned() {
      runScanSequence();
    }
    window.addEventListener('pass-scanned', onScanned);

    // Deep link from the volunteer scanner: /dashboard/user/pass?scanned=true
    // Kicked off on the next tick so the effect body stays free of
    // synchronous state updates.
    let kickoff: number | undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get('scanned') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      kickoff = window.setTimeout(runScanSequence, 0);
    }

    return () => {
      window.removeEventListener('pass-scanned', onScanned);
      if (kickoff !== undefined) clearTimeout(kickoff);
      clearTimers();
    };
  }, [runScanSequence, clearTimers]);

  useEffect(() => {
    let intervalId: number | undefined;

    // Only poll when the pass exists and is in the idle (ready) state
    if (pass && phase === 'idle') {
      intervalId = window.setInterval(async () => {
        try {
          const wasScanned = await checkRecentScan(pass.passId);
          if (wasScanned) {
            window.dispatchEvent(new Event('pass-scanned'));
          }
        } catch (err) {
          // Silently ignore polling errors
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pass, phase]);

  if (!pass) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-bento border border-line bg-panel p-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-panel-alt">
            <Ticket className="h-6 w-6 text-fg-dim" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold tracking-tight">No pass yet</h2>
          <p className="mt-2 text-sm text-fg-dim">
            Complete your profile and register for the festival to get your
            digital pass.
          </p>
        </div>
      </div>
    );
  }

  const scanning = phase === 'scanning';
  const confirmed = phase === 'confirmed';

  return (
    <div className="w-full max-w-sm">
      <div
        className={`relative overflow-hidden rounded-bento transition-shadow duration-500 ${
          confirmed ? 'shadow-[0_0_0_2px_var(--color-lime)]' : ''
        }`}
      >
        {/* ---- Header: neon block ---- */}
        <div className="relative bg-lime px-6 pb-8 pt-5 text-void">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow tone="lime">Goa Startup Festival</Eyebrow>
              <p className="mt-1 text-2xl font-bold leading-none tracking-tighter">2026</p>
            </div>
            <Chip tone="lime" className="capitalize">{userRole}</Chip>
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-void/60">
            Holder
          </p>
          <p className="truncate text-lg font-bold leading-tight tracking-tight">
            {userName}
          </p>
        </div>

        {/* ---- Perforation ---- */}
        <div className="relative h-0">
          <span
            className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-dsh"
            aria-hidden="true"
          />
          <span
            className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-dsh"
            aria-hidden="true"
          />
        </div>

        {/* ---- QR body ---- */}
        <div className="relative bg-panel px-6 py-7">
          <div
            className="absolute inset-x-6 top-0 border-t-2 border-dashed border-line"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center gap-4">
            {/* QR sits on a permanent white field for reliable scanning */}
            <div className="relative overflow-hidden rounded-tile bg-white p-4">
              <QRCodeSVG
                value={pass.qrToken}
                size={180}
                level="M"
                marginSize={0}
                bgColor="#ffffff"
                fgColor="#0a0a0b"
              />

              {/* Sweep line while scanning */}
              {scanning && (
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan-sweep bg-gradient-to-b from-transparent via-lime/70 to-transparent"
                  aria-hidden="true"
                />
              )}

              {/* Confirmation stamp */}
              {confirmed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-lime/95">
                  <CheckCircle2
                    className="h-12 w-12 animate-stamp-in text-void"
                    aria-hidden="true"
                  />
                  <p className="animate-stamp-in text-base font-bold tracking-tight text-void">
                    Checked in
                  </p>
                </div>
              )}
            </div>

            <p className="font-mono text-xl font-bold tracking-[0.18em]">
              {pass.passId}
            </p>

            {/* Live region so the state change is announced */}
            <p className="sr-only" role="status" aria-live="polite">
              {scanning ? 'Scanning pass' : confirmed ? 'Pass checked in' : ''}
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-fg-dim">
              <ScanLine
                className={`h-3.5 w-3.5 ${scanning ? 'animate-neon-pulse text-lime' : ''}`}
                aria-hidden="true"
              />
              {scanning
                ? 'Hold steady…'
                : confirmed
                  ? 'Entry confirmed'
                  : 'Show to a volunteer'}
            </div>
          </div>
        </div>

        {/* ---- Stub footer ---- */}
        <div className="flex items-center justify-between bg-inverse px-6 py-3 text-on-inverse">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-inverse/50">
              Issued
            </p>
            <p className="text-xs font-semibold">
              {new Date(pass.issuedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-inverse/50">
            Non-transferable
          </p>
        </div>
      </div>

      {/* Demo trigger removed — animation triggers automatically on real scan */}
    </div>
  );
}
