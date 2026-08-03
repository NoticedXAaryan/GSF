import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventForm, type EventFormData } from "@/components/dashboard/EventForm";
import userEvent from "@testing-library/user-event";

describe("EventForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly in create mode", () => {
    render(<EventForm event={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Event" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument();
  });

  it("renders correctly in edit mode", () => {
    const editData = {
      name: "Test Event",
      description: "Test Desc",
      date: "2026-10-15",
      day: 1,
      startTime: "10:00",
      endTime: "12:00",
      venue: "Main Hall",
      type: "open" as const,
      capacity: null,
      coordinatorName: "Alice",
      targetAudience: "all",
      status: "published" as const,
    };

    render(<EventForm event={editData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByDisplayValue("Test Event")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Event" })).toBeInTheDocument();
    
    // Status should be present in edit mode
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Published")).toBeInTheDocument();
  });

  describe("Event Types & Shortlisting Logic", () => {
    const types = ["open", "registration", "restricted", "shortlisted"];
    
    types.forEach((eventType) => {
      it(`handles event type: ${eventType}`, async () => {
        const user = userEvent.setup();
        render(<EventForm event={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        
        const typeSelect = screen.getByLabelText(/Event Type/i);
        await user.selectOptions(typeSelect, eventType);
        
        const shortlistingCheckbox = screen.getByLabelText(/Require manual approval/i) as HTMLInputElement;
        
        if (eventType === "shortlisted") {
          expect(shortlistingCheckbox).toBeChecked();
          expect(shortlistingCheckbox).toBeDisabled();
        } else {
          // Should not be disabled, user can toggle it
          expect(shortlistingCheckbox).not.toBeDisabled();
        }
      });
    });
  });

  it("validates required fields on submit", async () => {
    const user = userEvent.setup();
    render(<EventForm event={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByRole("button", { name: "Create Event" }));
    
    // onSubmit shouldn't be called if validation fails
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Expect error messages
    expect(screen.getByText("Event name is required")).toBeInTheDocument();
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(screen.getByText("Start time is required")).toBeInTheDocument();
    expect(screen.getByText("End time is required")).toBeInTheDocument();
    expect(screen.getByText("Venue is required")).toBeInTheDocument();
  });

  it("submits the form successfully with correct data", async () => {
    const user = userEvent.setup();
    render(<EventForm event={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText(/Event Name/i), "Hackathon");
    await user.type(screen.getByLabelText(/Date/i), "2026-11-20");
    await user.type(screen.getByLabelText(/Start Time/i), "09:00");
    await user.type(screen.getByLabelText(/End Time/i), "21:00");
    await user.type(screen.getByLabelText(/Venue/i), "Lab 1");
    
    await user.click(screen.getByRole("button", { name: "Create Event" }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Hackathon",
          date: "2026-11-20",
          startTime: "09:00",
          endTime: "21:00",
          venue: "Lab 1",
          type: "open",
        })
      );
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<EventForm event={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
