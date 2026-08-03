"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { scannerAudio } from "@/lib/audio";

interface SubEventOption {
  id: string;
  name: string;
}

interface QRScannerProps {
  events: SubEventOption[];
  onScanResult?: (result: ScanResultData) => void;
}

interface ScanResultData {
  result: "allowed" | "denied" | "already_checked_in";
  userName?: string;
  reason?: string;
  userData?: {
    name: string;
    email: string;
    phone: string;
    college: string;
    course: string;
    enrollmentNumber: string;
    universityId: string;
    accountStatus: string;
  };
}

interface ScanHistoryEntry {
  result: ScanResultData;
  timestamp: number;
  eventName: string;
}

export function QRScanner({ events, onScanResult }: QRScannerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [pendingValidation, setPendingValidation] = useState<ScanResultData | null>(null);
  const [currentQrToken, setCurrentQrToken] = useState<string>("");
  const [checkInCount, setCheckInCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [paused, setPaused] = useState(false);

  const scannerRef = useRef<unknown>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopScanner = useCallback(async () => {
    try {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      if (scannerRef.current) {
        const scanner = scannerRef.current as { stop: () => Promise<void>; clear: () => void };
        await scanner.stop();
        scanner.clear();
        scannerRef.current = null;
      }
    } catch {
      // Scanner may already be stopped
    }
    setScanning(false);
    setCameraLoading(false);
    setPaused(false);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const addToHistory = useCallback((result: ScanResultData) => {
    const eventName = events.find((e) => e.id === selectedEventId)?.name ?? "Unknown";
    setScanHistory((prev) => [
      { result, timestamp: Date.now(), eventName },
      ...prev.slice(0, 4), // Keep last 5
    ]);
  }, [events, selectedEventId]);

  const handleScanResult = useCallback(
    async (decodedText: string) => {
      // Prevent multiple scans while processing or paused
      if (loading || paused || pendingValidation) return;
      setLoading(true);
      setError(null);
      setCurrentQrToken(decodedText);
      
      // Initial scan detected feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      scannerAudio?.playScanBeep();

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: selectedEventId,
            qrToken: decodedText,
            action: 'validate',
          }),
        });

        if (!response.ok) {
          const data: ScanResultData = {
            result: "denied",
            reason: `Server error (${response.status})`,
          };
          setScanResult(data);
          onScanResult?.(data);
          addToHistory(data);
          setLoading(false);
          
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
          scannerAudio?.playErrorBeep();
          
          return;
        }

        const data = (await response.json()) as ScanResultData;
        
        if (data.result === 'allowed') {
          // Pause the scanner to show validation UI
          setPaused(true);
          setPendingValidation(data);
          if (scannerRef.current) {
            const scanner = scannerRef.current as { pause: (arg: boolean) => void };
            if (typeof scanner.pause === 'function') {
              scanner.pause(true);
            }
          }
        } else {
          // It was denied or already checked in, show standard result UI
          setScanResult(data);
          onScanResult?.(data);
          addToHistory(data);
          
          if (data.result === 'denied') {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
            scannerAudio?.playErrorBeep();
          } else {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
            scannerAudio?.playErrorBeep(); // Already checked in is an error state
          }
          
          setPaused(true);
          pauseTimerRef.current = setTimeout(() => {
            setPaused(false);
            setScanResult(null);
            pauseTimerRef.current = null;
          }, 3000);
        }
      } catch {
        const data: ScanResultData = {
          result: "denied",
          reason: "Network error — check your connection",
        };
        setScanResult(data);
        onScanResult?.(data);
        addToHistory(data);
        
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        scannerAudio?.playErrorBeep();
      } finally {
        setLoading(false);
      }
    },
    [selectedEventId, loading, paused, pendingValidation, onScanResult, addToHistory]
  );

  const handleConfirmCheckin = async () => {
    if (!currentQrToken || !pendingValidation) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          qrToken: currentQrToken,
          action: 'confirm',
        }),
      });

      if (!response.ok) {
        const data: ScanResultData = {
          result: "denied",
          reason: `Server error (${response.status})`,
        };
        setScanResult(data);
        onScanResult?.(data);
        addToHistory(data);
        
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        scannerAudio?.playErrorBeep();
      } else {
        const data = (await response.json()) as ScanResultData;
        setScanResult(data);
        onScanResult?.(data);
        addToHistory(data);

        if (data.result === "allowed") {
          setCheckInCount((prev) => prev + 1);
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
          scannerAudio?.playSuccessBeep();
        } else {
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
          scannerAudio?.playErrorBeep();
        }
      }
    } catch {
      const data: ScanResultData = {
        result: "denied",
        reason: "Network error — check your connection",
      };
      setScanResult(data);
      onScanResult?.(data);
      addToHistory(data);
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      scannerAudio?.playErrorBeep();
    } finally {
      setLoading(false);
      setPendingValidation(null);
      
      if (scannerRef.current) {
        const scanner = scannerRef.current as { resume: () => void };
        if (typeof scanner.resume === 'function') {
          scanner.resume();
        }
      }
      
      pauseTimerRef.current = setTimeout(() => {
        setPaused(false);
        setScanResult(null);
        pauseTimerRef.current = null;
      }, 3000);
    }
  };

  const handleCancelCheckin = () => {
    setPendingValidation(null);
    setCurrentQrToken("");
    setPaused(false);
    if (scannerRef.current) {
      const scanner = scannerRef.current as { resume: () => void };
      if (typeof scanner.resume === 'function') {
        scanner.resume();
      }
    }
  };



  const startScanner = useCallback(async () => {
    if (!selectedEventId) {
      setError("Please select a sub-event first");
      return;
    }

    setError(null);
    setScanResult(null);
    setCameraLoading(true);

    try {
      // Dynamically import html5-qrcode to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      // Wait a tick for React to render the container without "hidden"
      await new Promise(resolve => setTimeout(resolve, 50));

      const containerId = "qr-scanner-container";

      // Ensure container exists
      if (!scannerContainerRef.current) return;

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScanResult(decodedText);
        },
        () => {
          // QR code scanning failure — ignore (means no QR found in frame)
        }
      );

      setScanning(true);
      setCameraLoading(false);
    } catch (err) {
      setCameraLoading(false);
      let message = "Failed to access camera";
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          message = "Camera access was denied. Please check your browser settings.";
        } else if (err.name === 'NotFoundError') {
          message = "No camera detected on this device.";
        } else {
          message = err.message;
        }
      } else if (typeof err === 'string') {
        if (err.includes('NotAllowedError')) {
          message = "Camera access was denied. Please check your browser settings.";
        } else if (err.includes('NotFoundError')) {
          message = "No camera detected on this device.";
        } else {
          message = err;
        }
      }

      setError(message);
      const data: ScanResultData = {
        result: "denied",
        reason: `Camera error: ${message}`,
      };
      setScanResult(data);
      onScanResult?.(data);
    }
  }, [selectedEventId, handleScanResult, onScanResult]);

  const handleStopScanner = useCallback(async () => {
    await stopScanner();
  }, [stopScanner]);

  const resultBgClass =
    scanResult?.result === "allowed"
      ? "bg-lime text-void"
      : scanResult?.result === "already_checked_in"
        ? "bg-volt text-void"
        : scanResult?.result === "denied"
          ? "bg-magenta text-void"
          : "";

  // Accent fills already carry near-black content, so the icon rides the fill.
  const resultIconClass = "text-void";

  // ── Empty state: no events assigned ──
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">QR Scanner</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-panel-alt">
              <ScanLineIcon className="h-8 w-8 text-fg-dim" />
            </span>
            <div>
              <h4 className="text-base font-bold text-fg">No Events Assigned</h4>
              <p className="mt-1 max-w-sm text-sm text-fg-dim">
                You are not assigned to any check-in desks yet. Contact an admin
                to get assigned to a sub-event before you can start scanning.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-fg">QR Scanner</h3>
          <span className="rounded-full bg-azure px-3 py-1 text-sm font-medium text-void">
            {checkInCount} checked in
          </span>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Event selector */}
        <Select
          label="Sub-Event"
          placeholder="Select a sub-event to scan for"
          options={events.map((e) => ({ value: e.id, label: e.name }))}
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            setScanResult(null);
          }}
          disabled={scanning}
        />

        {/* Scanner controls */}
        <div className="flex gap-2">
          {!scanning ? (
            <Button
              variant="primary"
              onClick={startScanner}
              disabled={!selectedEventId || cameraLoading}
              className="w-full"
            >
              {cameraLoading ? (
                <>
                  <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                  Starting Camera…
                </>
              ) : (
                <>
                  <CameraIcon className="mr-2 h-5 w-5" />
                  Start Scanning
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleStopScanner}
              className="w-full"
            >
              <StopIcon className="mr-2 h-5 w-5" />
              Stop Scanner
            </Button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <p className="text-sm font-semibold text-magenta" role="alert">
            {error}
          </p>
        )}

        {/* Camera loading state */}
        {cameraLoading && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-bento border border-line bg-panel-alt py-12">
            <SpinnerIcon className="h-8 w-8 animate-spin text-lime" />
            <p className="text-sm font-medium text-fg-dim">
              Initializing camera…
            </p>
          </div>
        )}

        {/* Camera preview */}
        <div
          ref={scannerContainerRef}
          id="qr-scanner-container"
          className={`relative w-full overflow-hidden rounded-bento transition-all ${(scanning || cameraLoading) ? "min-h-[300px] ring-2 ring-lime/50 shadow-[0_0_15px_rgba(153,255,51,0.1)]" : "hidden"}`}
        />

        {/* Paused indicator */}
        {paused && scanning && !pendingValidation && (
          <p className="text-center text-xs font-medium text-fg-dim animate-neon-pulse">
            Resuming scanner in a moment…
          </p>
        )}

        {/* Pending Validation Display */}
        {pendingValidation && pendingValidation.userData && (
          <div className="animate-stamp-in rounded-bento border border-lime/30 bg-panel-alt p-4">
            <h4 className="mb-3 text-sm font-semibold text-fg">Attendee Validation</h4>
            <div className="space-y-2 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fg-dim">Name</span>
                <span className="text-sm text-fg">{pendingValidation.userData.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fg-dim">College & Course</span>
                <span className="text-sm text-fg">{pendingValidation.userData.college} — {pendingValidation.userData.course}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-dim">Enrollment No.</span>
                  <span className="text-sm text-fg font-mono">{pendingValidation.userData.enrollmentNumber || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-dim">Mobile</span>
                  <span className="text-sm text-fg">{pendingValidation.userData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={handleConfirmCheckin} disabled={loading}>
                Confirm Check-in
              </Button>
              <Button variant="secondary" onClick={handleCancelCheckin} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Scan result display */}
        {scanResult && (
          <div
            className={`animate-stamp-in rounded-bento p-4 ${resultBgClass}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              {scanResult.result === "allowed" && (
                <CheckCircleIcon className={`h-8 w-8 flex-shrink-0 ${resultIconClass}`} />
              )}
              {scanResult.result === "already_checked_in" && (
                <WarningIcon className={`h-8 w-8 flex-shrink-0 ${resultIconClass}`} />
              )}
              {scanResult.result === "denied" && (
                <XCircleIcon className={`h-8 w-8 flex-shrink-0 ${resultIconClass}`} />
              )}

              <div>
                {scanResult.result === "allowed" && (
                  <>
                    <p className="font-semibold text-void">Check-in Successful</p>
                    <p className="text-sm text-void/80">{scanResult.userName}</p>
                  </>
                )}
                {scanResult.result === "already_checked_in" && (
                  <>
                    <p className="font-semibold text-void">Already Checked In</p>
                    <p className="text-sm text-void/80">
                      {scanResult.userName} — already checked in
                    </p>
                  </>
                )}
                {scanResult.result === "denied" && (
                  <>
                    <p className="font-semibold text-void">Denied</p>
                    <p className="text-sm text-void/80">{scanResult.reason}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-2">
            <SpinnerIcon className="h-5 w-5 animate-spin text-lime" />
            <span className="ml-2 text-sm text-fg-dim">Processing scan…</span>
          </div>
        )}

        {/* Scan history */}
        {scanHistory.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-dim">
              Recent Scans
            </h4>
            <div className="space-y-1.5">
              {scanHistory.map((entry, i) => {
                const bg =
                  entry.result.result === "allowed"
                    ? "border-lime/30 bg-lime/10"
                    : entry.result.result === "already_checked_in"
                      ? "border-volt/30 bg-volt/10"
                      : "border-magenta/30 bg-magenta/10";
                return (
                  <div
                    key={`${entry.timestamp}-${i}`}
                    className={`flex items-center justify-between rounded-tile border px-3 py-2 ${bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          entry.result.result === "allowed"
                            ? "bg-lime"
                            : entry.result.result === "already_checked_in"
                              ? "bg-volt"
                              : "bg-magenta"
                        }`}
                      />
                      <span className="truncate text-xs font-medium text-fg">
                        {entry.result.userName || entry.result.reason || entry.result.result}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-fg-dim">
                      {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Icon Components ──

function ScanLineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
      />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
