import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { FESTIVAL_FAQS } from "@/lib/landing/content";
import type { FaqItem } from "@/lib/landing/content/contracts";

// ---- Mock motion/react for deterministic testing ----
const mockUseReducedMotion = vi.fn<() => boolean | null>(() => false);

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(
      (
        {
          children,
          initial,
          whileInView,
          viewport,
          transition,
          className,
          ...rest
        }: {
          children?: React.ReactNode;
          initial?: Record<string, unknown>;
          whileInView?: Record<string, unknown>;
          viewport?: Record<string, unknown>;
          transition?: Record<string, unknown>;
          className?: string;
        } & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>,
      ) => (
        <div
          ref={ref}
          className={className}
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(whileInView)}
          data-viewport={JSON.stringify(viewport)}
          data-transition={JSON.stringify(transition)}
          {...rest}
        >
          {children}
        </div>
      ),
    ),
    section: React.forwardRef(
      (
        {
          children,
          initial,
          whileInView,
          viewport,
          transition,
          className,
          ...rest
        }: {
          children?: React.ReactNode;
          initial?: Record<string, unknown>;
          whileInView?: Record<string, unknown>;
          viewport?: Record<string, unknown>;
          transition?: Record<string, unknown>;
          className?: string;
        } & Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) => (
        <section
          ref={ref}
          className={className}
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(whileInView)}
          data-viewport={JSON.stringify(viewport)}
          data-transition={JSON.stringify(transition)}
          {...rest}
        >
          {children}
        </section>
      ),
    ),
  },
  MotionConfig: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useReducedMotion: () => mockUseReducedMotion(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { MotionProvider } from "@/components/landing/MotionProvider";
import { Reveal } from "@/components/landing/Reveal";

// ------ FAQ Accordion Tests ------
describe("FaqAccordion", () => {
  const testItems: readonly FaqItem[] = FESTIVAL_FAQS;

  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  describe("Initial collapse state", () => {
    it("all answers are collapsed by default (aria-expanded=false on all buttons)", () => {
      render(<FaqAccordion items={testItems} />);
      const buttons = screen.getAllByRole("button");
      for (const button of buttons) {
        expect(button).toHaveAttribute("aria-expanded", "false");
      }
    });

    it("no answer panels have visible content initially (reduced-motion mode)", () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<FaqAccordion items={testItems} />);
      // In reduced-motion mode, collapsed panels have no answer div rendered
      const panels = testItems.map((item) =>
        document.getElementById(`faq-panel-${item.id}`),
      );
      for (const panel of panels) {
        expect(panel).toBeInTheDocument();
        // Panel should not contain visible answer text since all are collapsed
        expect(panel!.textContent).toBe("");
      }
    });
  });

  describe("Click activation", () => {
    it("clicking a question expands that answer (aria-expanded becomes true)", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      await user.click(firstButton);

      expect(firstButton).toHaveAttribute("aria-expanded", "true");
    });

    it("clicking an expanded question collapses it (toggle semantics)", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      await user.click(firstButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "true");

      await user.click(firstButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Keyboard activation (Enter/Space)", () => {
    it("Enter key expands a collapsed question", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      firstButton.focus();
      await user.keyboard("{Enter}");

      expect(firstButton).toHaveAttribute("aria-expanded", "true");
    });

    it("Space key expands a collapsed question", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      firstButton.focus();
      await user.keyboard(" ");

      expect(firstButton).toHaveAttribute("aria-expanded", "true");
    });

    it("Enter key collapses an expanded question (toggle)", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      // Expand first
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "true");

      // Collapse with Enter
      firstButton.focus();
      await user.keyboard("{Enter}");
      expect(firstButton).toHaveAttribute("aria-expanded", "false");
    });

    it("Space key collapses an expanded question (toggle)", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      // Expand first
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "true");

      // Collapse with Space
      firstButton.focus();
      await user.keyboard(" ");
      expect(firstButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Switch semantics (single-open behavior)", () => {
    it("clicking a different question closes the current and opens the new one", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);

      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      const secondButton = screen.getByRole("button", {
        name: new RegExp(testItems[1].question),
      });

      // Open first
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "true");
      expect(secondButton).toHaveAttribute("aria-expanded", "false");

      // Open second - first should close
      await user.click(secondButton);
      expect(firstButton).toHaveAttribute("aria-expanded", "false");
      expect(secondButton).toHaveAttribute("aria-expanded", "true");
    });

    it("only one answer is visible at a time", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);

      // Open first item
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      await user.click(firstButton);

      // Count expanded buttons
      const buttons = screen.getAllByRole("button");
      const expandedButtons = buttons.filter(
        (btn) => btn.getAttribute("aria-expanded") === "true",
      );
      expect(expandedButtons).toHaveLength(1);
    });

    it("switching through multiple items always keeps exactly one open", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);

      for (let i = 0; i < Math.min(4, testItems.length); i++) {
        const btn = screen.getByRole("button", {
          name: new RegExp(testItems[i].question),
        });
        await user.click(btn);

        const allButtons = screen.getAllByRole("button");
        const expanded = allButtons.filter(
          (b) => b.getAttribute("aria-expanded") === "true",
        );
        expect(expanded).toHaveLength(1);
        expect(expanded[0]).toBe(btn);
      }
    });
  });

  describe("ARIA relationships", () => {
    it("each button has aria-controls pointing to the corresponding panel ID", () => {
      render(<FaqAccordion items={testItems} />);
      for (const item of testItems) {
        const button = document.getElementById(`faq-button-${item.id}`);
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("aria-controls", `faq-panel-${item.id}`);
      }
    });

    it("each panel has the stable ID matching its button aria-controls", () => {
      render(<FaqAccordion items={testItems} />);
      for (const item of testItems) {
        const panel = document.getElementById(`faq-panel-${item.id}`);
        expect(panel).toBeInTheDocument();
      }
    });

    it("each panel has role=region and aria-labelledby linking to its button", () => {
      render(<FaqAccordion items={testItems} />);
      for (const item of testItems) {
        const panel = document.getElementById(`faq-panel-${item.id}`);
        expect(panel).toHaveAttribute("role", "region");
        expect(panel).toHaveAttribute("aria-labelledby", `faq-button-${item.id}`);
      }
    });

    it("panel IDs are stable across re-renders", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<FaqAccordion items={testItems} />);

      // Collect initial IDs
      const initialIds = testItems.map((item) => `faq-panel-${item.id}`);
      for (const id of initialIds) {
        expect(document.getElementById(id)).toBeInTheDocument();
      }

      // Interact and re-render
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      await user.click(firstButton);
      rerender(<FaqAccordion items={testItems} />);

      // IDs should remain the same
      for (const id of initialIds) {
        expect(document.getElementById(id)).toBeInTheDocument();
      }
    });
  });

  describe("Focus visibility", () => {
    it("question buttons are focusable", () => {
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });

    it("all FAQ buttons use native button elements for built-in keyboard support", () => {
      render(<FaqAccordion items={testItems} />);
      const buttons = screen.getAllByRole("button");
      for (const button of buttons) {
        expect(button.tagName).toBe("BUTTON");
        expect(button).toHaveAttribute("type", "button");
      }
    });
  });

  describe("Transition bounds", () => {
    it("in normal mode, panels use CSS grid-template-rows transition with 300ms ease-out", () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<FaqAccordion items={testItems} />);
      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      expect(panel!.style.transition).toBe("grid-template-rows 300ms ease-out");
    });

    it("collapsed panels use grid-template-rows: 0fr", () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<FaqAccordion items={testItems} />);
      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      expect(panel!.style.gridTemplateRows).toBe("0fr");
    });

    it("expanded panels use grid-template-rows: 1fr", async () => {
      mockUseReducedMotion.mockReturnValue(false);
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      await user.click(firstButton);

      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      expect(panel!.style.gridTemplateRows).toBe("1fr");
    });
  });

  describe("Reduced motion", () => {
    beforeEach(() => {
      mockUseReducedMotion.mockReturnValue(true);
    });

    it("in reduced-motion mode, panels have no transition style", () => {
      render(<FaqAccordion items={testItems} />);
      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      // reduced-motion mode does not apply inline grid/transition style
      expect(panel!.style.transition).toBe("");
      expect(panel!.style.gridTemplateRows).toBe("");
    });

    it("in reduced-motion mode, expanded answer appears immediately (no animation)", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });

      await user.click(firstButton);

      // The answer text should be in the DOM immediately
      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      expect(panel!.textContent).toContain(testItems[0].answer);
    });

    it("in reduced-motion mode, collapsed answer is removed from DOM", () => {
      render(<FaqAccordion items={testItems} />);
      const panel = document.getElementById(`faq-panel-${testItems[0].id}`);
      expect(panel!.textContent).toBe("");
    });

    it("chevron icon has no transition in reduced-motion mode", async () => {
      const user = userEvent.setup();
      render(<FaqAccordion items={testItems} />);
      const firstButton = screen.getByRole("button", {
        name: new RegExp(testItems[0].question),
      });
      await user.click(firstButton);

      const svg = firstButton.querySelector("svg");
      expect(svg!.style.transition).toBe("none");
    });
  });
});

// ------ MotionProvider Tests ------
describe("MotionProvider", () => {
  it("renders its children", () => {
    render(
      <MotionProvider>
        <div data-testid="child">Hello</div>
      </MotionProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("wraps children with MotionConfig (reducedMotion=user)", () => {
    // MotionConfig is mocked as a passthrough; the key test is
    // that children are rendered and the component doesn't crash
    const { container } = render(
      <MotionProvider>
        <span>Nested content</span>
      </MotionProvider>,
    );
    expect(container).toHaveTextContent("Nested content");
  });
});

// ------ Reveal Component Tests ------
describe("Reveal", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renders children inside the motion wrapper", () => {
    render(
      <Reveal>
        <p>Reveal content</p>
      </Reveal>,
    );
    expect(screen.getByText("Reveal content")).toBeInTheDocument();
  });

  it("applies className to the wrapper", () => {
    const { container } = render(
      <Reveal className="test-class">
        <p>Content</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveClass("test-class");
  });

  it("uses div as default wrapper element", () => {
    const { container } = render(
      <Reveal>
        <p>Content</p>
      </Reveal>,
    );
    expect(container.firstElementChild!.tagName).toBe("DIV");
  });

  it("supports custom element tags via 'as' prop", () => {
    const { container } = render(
      <Reveal as="section">
        <p>Content</p>
      </Reveal>,
    );
    expect(container.firstElementChild!.tagName).toBe("SECTION");
  });

  describe("Normal motion mode (IntersectionObserver available)", () => {
    it("sets initial state with opacity 0 and y offset (up to 24px)", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const initialData = JSON.parse(wrapper.getAttribute("data-initial")!);
      expect(initialData.opacity).toBe(0);
      expect(initialData.y).toBeGreaterThan(0);
      expect(initialData.y).toBeLessThanOrEqual(24);
    });

    it("sets animate state with opacity 1 and y 0", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const animateData = JSON.parse(wrapper.getAttribute("data-animate")!);
      expect(animateData.opacity).toBe(1);
      expect(animateData.y).toBe(0);
    });

    it("sets viewport with once: true and amount: 0.2 (one-time reveal at 20%)", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const viewportData = JSON.parse(wrapper.getAttribute("data-viewport")!);
      expect(viewportData.once).toBe(true);
      expect(viewportData.amount).toBe(0.2);
    });

    it("transition duration is between 300ms and 600ms", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const transitionData = JSON.parse(
        wrapper.getAttribute("data-transition")!,
      );
      const durationMs = transitionData.duration * 1000;
      expect(durationMs).toBeGreaterThanOrEqual(300);
      expect(durationMs).toBeLessThanOrEqual(600);
    });

    it("transition uses ease-out easing", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const transitionData = JSON.parse(
        wrapper.getAttribute("data-transition")!,
      );
      expect(transitionData.ease).toBe("easeOut");
    });
  });

  describe("Reduced motion mode", () => {
    beforeEach(() => {
      mockUseReducedMotion.mockReturnValue(true);
    });

    it("initial state is the final state (opacity 1, y 0) - no animation", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const initialData = JSON.parse(wrapper.getAttribute("data-initial")!);
      expect(initialData.opacity).toBe(1);
      expect(initialData.y).toBe(0);
    });

    it("animate state matches final state (opacity 1, y 0)", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const animateData = JSON.parse(wrapper.getAttribute("data-animate")!);
      expect(animateData.opacity).toBe(1);
      expect(animateData.y).toBe(0);
    });

    it("no transition is set (undefined/null) for immediate final state", () => {
      const { container } = render(
        <Reveal>
          <p>Content</p>
        </Reveal>,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const transitionRaw = wrapper.getAttribute("data-transition");
      // Should be undefined/null - serialized as "undefined" or empty
      expect(
        transitionRaw === null ||
          transitionRaw === "undefined" ||
          transitionRaw === "null",
      ).toBe(true);
    });
  });

  describe("One-time reveal behavior", () => {
    it("viewport.once is always true regardless of motion preference", () => {
      // Normal mode
      mockUseReducedMotion.mockReturnValue(false);
      const { container: normalContainer } = render(
        <Reveal>
          <p>Normal</p>
        </Reveal>,
      );
      const normalViewport = JSON.parse(
        (normalContainer.firstElementChild as HTMLElement).getAttribute(
          "data-viewport",
        )!,
      );
      expect(normalViewport.once).toBe(true);

      // Reduced motion mode
      mockUseReducedMotion.mockReturnValue(true);
      const { container: reducedContainer } = render(
        <Reveal>
          <p>Reduced</p>
        </Reveal>,
      );
      const reducedViewport = JSON.parse(
        (reducedContainer.firstElementChild as HTMLElement).getAttribute(
          "data-viewport",
        )!,
      );
      expect(reducedViewport.once).toBe(true);
    });
  });
});
