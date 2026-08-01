"use client";

import { useState, type FormEvent } from "react";
import { createEventSchema } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { EventStatus, EventType } from "@/lib/types";

export interface EventFormData {
  name: string;
  description: string;
  date: string;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  type: EventType;
  capacity: number | null;
  coordinatorName: string;
  targetAudience: string;
  status?: EventStatus;
}

export interface EventFormProps {
  event: EventFormData | null;
  onSubmit: (data: EventFormData) => void | Promise<void>;
  onCancel: () => void;
}

const EVENT_TYPE_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "registration", label: "Registration" },
  { value: "restricted", label: "Restricted" },
  { value: "shortlisted", label: "Shortlisted" },
];

const DAY_OPTIONS = [
  { value: "1", label: "Day 1" },
  { value: "2", label: "Day 2" },
  { value: "3", label: "Day 3" },
  { value: "4", label: "Day 4" },
  { value: "5", label: "Day 5" },
];

/**
 * Returns valid status transitions for the given current status.
 * draft → published or archived
 * published → archived
 * archived → no transitions allowed
 */
function getValidStatusTransitions(currentStatus: EventStatus): { value: string; label: string }[] {
  switch (currentStatus) {
    case "draft":
      return [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ];
    case "published":
      return [
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ];
    case "archived":
      return [{ value: "archived", label: "Archived" }];
    default:
      return [{ value: "draft", label: "Draft" }];
  }
}

type FieldErrors = Partial<Record<string, string>>;

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const isEditMode = event !== null;

  // Form state
  const [name, setName] = useState(event?.name ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState(event?.date ?? "");
  const [day, setDay] = useState(String(event?.day ?? 1));
  const [startTime, setStartTime] = useState(event?.startTime ?? "");
  const [endTime, setEndTime] = useState(event?.endTime ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [type, setType] = useState<string>(event?.type ?? "open");
  const [capacity, setCapacity] = useState(event?.capacity != null ? String(event.capacity) : "");
  const [coordinatorName, setCoordinatorName] = useState(event?.coordinatorName ?? "");
  const [targetAudience, setTargetAudience] = useState(event?.targetAudience ?? "");
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "draft");

  // Validation and submission state
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors | null {
    const formData = {
      name: name.trim(),
      description: description.trim(),
      date,
      day: parseInt(day, 10),
      startTime,
      endTime,
      venue: venue.trim(),
      type,
      capacity: capacity ? parseInt(capacity, 10) : null,
      coordinatorName: coordinatorName.trim(),
      targetAudience: targetAudience.trim() || "all",
    };

    const result = createEventSchema.safeParse(formData);

    if (result.success) {
      return null;
    }

    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (path && !fieldErrors[String(path)]) {
        fieldErrors[String(path)] = issue.message;
      }
    }
    return fieldErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const formData: EventFormData = {
        name: name.trim(),
        description: description.trim(),
        date,
        day: parseInt(day, 10),
        startTime,
        endTime,
        venue: venue.trim(),
        type: type as EventType,
        capacity: capacity ? parseInt(capacity, 10) : null,
        coordinatorName: coordinatorName.trim(),
        targetAudience: targetAudience.trim() || "all",
      };

      if (isEditMode) {
        formData.status = status;
      }

      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Name */}
      <Input
        label="Event Name *"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter event name"
        error={errors.name}
        maxLength={200}
      />

      {/* Description */}
      <div className="w-full">
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          maxLength={2000}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${
            errors.description
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }`}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1.5 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* Date and Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full">
          <label
            htmlFor="date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${
              errors.date
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            aria-invalid={errors.date ? "true" : undefined}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date && (
            <p id="date-error" className="mt-1.5 text-sm text-red-600">
              {errors.date}
            </p>
          )}
        </div>

        <Select
          label="Day *"
          name="day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          options={DAY_OPTIONS}
          error={errors.day}
        />
      </div>

      {/* Start Time and End Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full">
          <label
            htmlFor="startTime"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Start Time *
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${
              errors.startTime
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            aria-invalid={errors.startTime ? "true" : undefined}
            aria-describedby={errors.startTime ? "startTime-error" : undefined}
          />
          {errors.startTime && (
            <p id="startTime-error" className="mt-1.5 text-sm text-red-600">
              {errors.startTime}
            </p>
          )}
        </div>

        <div className="w-full">
          <label
            htmlFor="endTime"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            End Time *
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${
              errors.endTime
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            aria-invalid={errors.endTime ? "true" : undefined}
            aria-describedby={errors.endTime ? "endTime-error" : undefined}
          />
          {errors.endTime && (
            <p id="endTime-error" className="mt-1.5 text-sm text-red-600">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Venue */}
      <Input
        label="Venue *"
        name="venue"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Enter venue"
        error={errors.venue}
        maxLength={200}
      />

      {/* Type and Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Event Type *"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={EVENT_TYPE_OPTIONS}
          error={errors.type}
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Leave blank for unlimited"
          error={errors.capacity}
        />
      </div>

      {/* Coordinator Name */}
      <Input
        label="Coordinator Name"
        name="coordinatorName"
        value={coordinatorName}
        onChange={(e) => setCoordinatorName(e.target.value)}
        placeholder="Enter coordinator name"
        error={errors.coordinatorName}
        maxLength={200}
      />

      {/* Target Audience */}
      <Input
        label="Target Audience"
        name="targetAudience"
        value={targetAudience}
        onChange={(e) => setTargetAudience(e.target.value)}
        placeholder="e.g., all, engineering students"
        error={errors.targetAudience}
        maxLength={200}
      />

      {/* Status (edit mode only) */}
      {isEditMode && event?.status && (
        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          options={getValidStatusTransitions(event.status)}
          error={errors.status}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {isEditMode ? "Update Event" : "Create Event"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
