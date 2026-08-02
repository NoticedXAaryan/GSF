'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface AttendanceExportProps {
  events: { id: string; name: string }[];
}

export function AttendanceExport({ events }: AttendanceExportProps) {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!selectedEventId) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/admin/attendance-export?eventId=${selectedEventId}`
      );
      if (!res.ok) {
        alert('Failed to download attendance data');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        res.headers.get('Content-Disposition')?.split('filename="')[1]?.replace('"', '') ||
        'attendance.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Network error');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-fg">
          Export Attendance Data
        </h3>
      </CardHeader>
      <CardBody className="space-y-3">
        <Select
          label="Event"
          placeholder="Select event to export"
          options={[
            { value: '', label: 'Select an event…' },
            ...events.map((e) => ({ value: e.id, label: e.name })),
          ]}
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        />
        <Button
          onClick={handleDownload}
          disabled={!selectedEventId || downloading}
          loading={downloading}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardBody>
    </Card>
  );
}
