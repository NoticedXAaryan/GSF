import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PassCard } from "@/components/dashboard/PassCard";

// Mock the QRCodeSVG component to simplify testing since it's an external library
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
}));

describe("PassCard", () => {
  it("renders empty state when pass is null", () => {
    render(<PassCard pass={null} userName="John Doe" userRole="attendee" />);
    
    expect(
      screen.getByText(/No pass issued yet\. Complete your profile/i)
    ).toBeInTheDocument();
  });

  describe("when pass is provided (testing all roles)", () => {
    const roles = ["attendee", "volunteer", "admin", "lead", "faculty"];
    const basePass = {
      passId: "PASS-12345",
      qrToken: "qr-secret-token",
      issuedAt: new Date("2026-08-01T10:00:00Z").getTime(),
    };

    roles.forEach((role) => {
      it(`renders correctly for role: ${role}`, () => {
        render(<PassCard pass={basePass} userName="Jane Doe" userRole={role} />);
        
        // Assertions for common elements
        expect(screen.getByText("PASS-12345")).toBeInTheDocument();
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        
        // Assertions for role badge
        expect(screen.getByText(role)).toBeInTheDocument();
        expect(screen.getByText(role)).toHaveClass("capitalize");
        
        // Assertions for QR code token
        expect(screen.getByTestId("qr-code")).toHaveTextContent("qr-secret-token");
        
        // Assertions for issued date format
        expect(screen.getByText(/Issued/i)).toBeInTheDocument();
      });
    });
  });
});
