"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AssignedVolunteer {
  id: string;
  name: string;
}

interface VolunteerAssignmentProps {
  subEventId: string;
  subEventName: string;
  assignedVolunteers: AssignedVolunteer[];
  onAssign: (userId: string) => Promise<void> | void;
  onRemove: (userId: string) => Promise<void> | void;
}

export function VolunteerAssignment({
  subEventId,
  subEventName,
  assignedVolunteers,
  onAssign,
  onRemove,
}: VolunteerAssignmentProps) {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function clearError() {
    setTimeout(() => setError(null), 3000);
  }

  async function handleAssign() {
    const trimmed = userId.trim();

    if (!trimmed) {
      setError("Please enter a user ID.");
      clearError();
      return;
    }

    // Check for duplicate assignment
    if (assignedVolunteers.some((v) => v.id === trimmed)) {
      setError("This volunteer is already assigned to this sub-event.");
      clearError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAssign(trimmed);
      setUserId("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to assign volunteer.";
      setError(message);
      clearError();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(volunteerId: string) {
    setRemovingId(volunteerId);
    setError(null);

    try {
      await onRemove(volunteerId);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove volunteer.";
      setError(message);
      clearError();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-900">
          Volunteers — {subEventName}
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Error display */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Assign volunteer input */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="User ID"
              placeholder="Enter user ID to assign"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAssign();
              }}
              disabled={loading}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            loading={loading}
            disabled={loading}
          >
            Assign
          </Button>
        </div>

        {/* Assigned volunteers list */}
        {assignedVolunteers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No volunteers assigned to this sub-event yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100" aria-label={`Assigned volunteers for ${subEventName}`}>
            {assignedVolunteers.map((volunteer) => (
              <li
                key={volunteer.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-800">{volunteer.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(volunteer.id)}
                  loading={removingId === volunteer.id}
                  disabled={removingId === volunteer.id}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Hidden input for sub-event context */}
        <input type="hidden" value={subEventId} name="subEventId" />
      </CardBody>
    </Card>
  );
}
