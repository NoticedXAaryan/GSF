"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

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
}

export function QRScanner({ events, onScanResult }: QRScannerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [checkInCount, setCheckInCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scannerRef = useRef<unknown>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    try {
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
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleScanResult = useCallback(
    async (decodedText: string) => {
      // Prevent multiple scans while processing
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: selectedEventId,
            qrToken: decodedText,
          }),
        });

        if (!response.ok) {
          const data: ScanResultData = {
            result: "denied",
            reason: `Server error (${response.status})`,
          };
          setScanResult(data);
          onScanResult?.(data);
          return;
        }

        const data = (await response.json()) as ScanResultData;
        setScanResult(data);
        onScanResult?.(data);

        if (data.result === "allowed") {
          setCheckInCount((prev) => prev + 1);
        }
      } catch {
        const data: ScanResultData = {
          result: "denied",
          reason: "Network error — check your connection",
        };
        setScanResult(data);
        onScanResult?.(data);
      } finally {
        setLoading(false);
      }
    },
    [selectedEventId, loading, onScanResult]
  );

  const startScanner = useCallback(async () => {
    if (!selectedEventId) {
      setError("Please select a sub-event first");
      return;
    }

    setError(null);
    setScanResult(null);

    try {
      // Dynamically import html5-qrcode to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access camera";
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
              disabled={!selectedEventId}
              className="w-full"
            >
              <CameraIcon className="mr-2 h-5 w-5" />
              Start Scanning
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

        {/* Camera preview */}
        <div
          ref={scannerContainerRef}
          id="qr-scanner-container"
          className={`w-full overflow-hidden rounded-bento ${scanning ? "min-h-[300px]" : "hidden"}`}
        />

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
            <svg
              className="h-5 w-5 animate-spin text-lime"
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
            <span className="ml-2 text-sm text-fg-dim">Processing scan…</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Icon Components ──

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
