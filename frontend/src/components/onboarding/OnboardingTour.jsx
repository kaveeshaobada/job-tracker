import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from "lucide-react";

export default function OnboardingTour() {
  const { user } = useAuth();
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  } = useOnboarding();

  const navigate = useNavigate();
  const location = useLocation();

  const [targetRect, setTargetRect] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, placement: "below" });

  // Handle route & mobile menu state when step changes
  useEffect(() => {
    if (!user || !isActive || !currentStep) return;

    try {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const isNavTarget = Boolean(currentStep.target && currentStep.target.includes("nav-"));

      if (isMobile && isNavTarget) {
        // Open and hold mobile menu open for nav target steps
        window.dispatchEvent(new CustomEvent("jobtrack-open-mobile-menu"));
      } else if (isMobile) {
        window.dispatchEvent(new CustomEvent("jobtrack-close-mobile-menu"));
      }

      // Automatically navigate only for page-content steps (not nav-target steps)
      if (!isNavTarget && currentStep.route && location.pathname !== currentStep.route) {
        navigate(currentStep.route);
      }

      if (currentStep.view) {
        window.dispatchEvent(
          new CustomEvent("jobtrack-set-dashboard-view", { detail: currentStep.view })
        );
      }

      if (currentStep.calendarView) {
        window.dispatchEvent(
          new CustomEvent("jobtrack-set-calendar-view", { detail: currentStep.calendarView })
        );
      }
    } catch (err) {
      console.error("Error handling onboarding step transition:", err);
    }
  }, [user, isActive, currentStepIndex, currentStep?.id]);

  // Universal Dynamic Target Element Tracker & Position Engine
  // Continuously monitors DOM element position, handles layout reflows and drawer slide-in animation
  useEffect(() => {
    if (!user || !isActive || !currentStep) return;

    let isMounted = true;
    let animFrameId = null;

    const measureTarget = () => {
      if (!isMounted) return;

      if (!currentStep.target) {
        setTargetRect(null);
        return;
      }

      let el = null;
      try {
        el = document.querySelector(currentStep.target);
      } catch {
        el = null;
      }

      if (!el) {
        setTargetRect(null);
        animFrameId = requestAnimationFrame(measureTarget);
        return;
      }

      try {
        const rect = el.getBoundingClientRect();
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const isNavTarget = Boolean(currentStep.target && currentStep.target.includes("nav-"));

        // Verify element is visible in viewport
        // For mobile menu items, rect.left must be >= 0 (sidebar drawer has finished sliding in)
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          (!isMobile || !isNavTarget || (rect.left >= 0 && rect.right <= window.innerWidth + 20));

        if (!isVisible) {
          setTargetRect(null);
          animFrameId = requestAnimationFrame(measureTarget);
          return;
        }

        const rounded = {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          bottom: Math.round(rect.bottom),
          right: Math.round(rect.right),
        };

        setTargetRect(rounded);

        if (!isMobile) {
          const spaceBelow = window.innerHeight - rounded.bottom;
          const preferAbove = spaceBelow < 240 && rounded.top > 240;

          const top = preferAbove ? rounded.top - 16 : rounded.bottom + 16;
          const left = Math.max(20, Math.min(rounded.left, window.innerWidth - 380));

          setPopoverPos({
            top,
            left,
            placement: preferAbove ? "above" : "below",
          });
        }
      } catch (err) {
        console.error("Error measuring target element:", err);
        setTargetRect(null);
      }

      // Continuously measure every frame while active to track layout shifts & animations
      animFrameId = requestAnimationFrame(measureTarget);
    };

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const isNavTarget = Boolean(currentStep.target && currentStep.target.includes("nav-"));

    if (currentStep.target && (!isMobile || !isNavTarget)) {
      try {
        const el = document.querySelector(currentStep.target);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      } catch {
        // Ignore scroll errors
      }
    }

    measureTarget();

    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);

    return () => {
      isMounted = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [user, isActive, currentStepIndex, currentStep?.id, location.pathname]);

  const handleSkip = () => {
    try {
      window.dispatchEvent(new CustomEvent("jobtrack-close-mobile-menu"));
    } catch {}
    skipTour();
  };

  const handleComplete = () => {
    try {
      window.dispatchEvent(new CustomEvent("jobtrack-close-mobile-menu"));
    } catch {}
    completeTour();
  };

  const handleNext = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const isNavTarget = Boolean(currentStep.target && currentStep.target.includes("nav-"));

    if (isMobile) {
      try {
        window.dispatchEvent(new CustomEvent("jobtrack-close-mobile-menu"));
      } catch {}
    }

    // Navigate to page route when leaving a nav step
    if (isNavTarget && currentStep.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }

    nextStep();
  };

  const handlePrev = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      try {
        window.dispatchEvent(new CustomEvent("jobtrack-close-mobile-menu"));
      } catch {}
    }
    prevStep();
  };

  if (!user || !isActive || !currentStep) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;
  const isCentered = !currentStep.target || !targetRect;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const pad = 6;
  const t = targetRect ? Math.max(0, targetRect.top - pad) : 0;
  const l = targetRect ? Math.max(0, targetRect.left - pad) : 0;
  const w = targetRect ? targetRect.width + pad * 2 : 0;
  const h = targetRect ? targetRect.height + pad * 2 : 0;
  const b = targetRect ? targetRect.bottom + pad : 0;
  const r = targetRect ? targetRect.right + pad : 0;

  return (
    /* Top-level Root Stacking Context z-[200] — Guarantees spotlight ring & tooltip card render ABOVE mobile sidebar (z-50) */
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
      {/* 
        Native 4-Box CSS Dark Cutout Overlay:
        Renders 4 dark boxes around targetRect leaving a 100% crisp, un-dimmed cutout hole over the target element.
      */}
      {isCentered ? (
        <div className="fixed inset-0 bg-black/40 pointer-events-none z-10" />
      ) : (
        <div className="pointer-events-none z-10">
          {/* Top Box */}
          <div
            style={{ height: `${t}px` }}
            className="fixed top-0 left-0 right-0 bg-black/40 transition-all duration-150"
          />
          {/* Bottom Box */}
          <div
            style={{ top: `${b}px` }}
            className="fixed bottom-0 left-0 right-0 bg-black/40 transition-all duration-150"
          />
          {/* Left Box */}
          <div
            style={{ top: `${t}px`, height: `${h}px`, width: `${l}px` }}
            className="fixed left-0 bg-black/40 transition-all duration-150"
          />
          {/* Right Box */}
          <div
            style={{ top: `${t}px`, height: `${h}px`, left: `${r}px` }}
            className="fixed right-0 bg-black/40 transition-all duration-150"
          />
        </div>
      )}

      {/* Glowing Accent Ring directly around target DOM element (z-20 inside z-[200] -> renders ABOVE sidebar z-50) */}
      {targetRect && (
        <div
          style={{
            top: `${t}px`,
            left: `${l}px`,
            width: `${w}px`,
            height: `${h}px`,
          }}
          className="fixed rounded-xl border-2 border-accent shadow-[0_0_25px_rgba(99,102,241,0.8)] ring-4 ring-accent/30 pointer-events-none z-20 transition-all duration-150"
        />
      )}

      {/* Step Tooltip Card Container (z-30 inside z-[200] -> renders ABOVE mobile sidebar z-50) */}
      <div
        className={`fixed inset-0 z-30 pointer-events-none flex ${
          isCentered
            ? "items-center justify-center p-4"
            : isMobile
            ? "items-end justify-center p-4 mb-2"
            : "block"
        }`}
        style={
          !isCentered && !isMobile
            ? {
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`,
                transform: popoverPos.placement === "above" ? "translateY(-100%)" : "none",
              }
            : {}
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: isMobile ? 24 : 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 24 : -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-full max-w-md bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-2xl shadow-2xl p-5 text-ink dark:text-ink-dark relative"
          >
            {/* Desktop Pointer Arrow pointing to target */}
            {!isCentered && !isMobile && (
              <div
                className={`absolute left-8 w-3 h-3 bg-elevated dark:bg-elevated-dark border-l border-t border-border-subtle dark:border-border-subtle-dark transform rotate-45 ${
                  popoverPos.placement === "above" ? "-bottom-1.5 border-t-0 border-l-0 border-r border-b" : "-top-1.5"
                }`}
              />
            )}

            {/* Header & Step Badge */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-accent/15 text-accent font-bold text-xs">
                  {currentStepIndex + 1}
                </span>
                <span className="text-xs font-semibold text-muted dark:text-muted-dark">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>

              {/* Workflow Connection Badge */}
              {currentStep.workflowBadge && (
                <span className="flex items-center gap-1 text-[11px] font-medium bg-surface dark:bg-surface-dark text-accent border border-accent/20 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                  {currentStep.workflowBadge}
                </span>
              )}

              <button
                onClick={handleSkip}
                className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark p-1 rounded-lg transition-colors ml-auto"
                title="Skip Tutorial"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface dark:bg-surface-dark h-1.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-accent h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>

            {/* Body */}
            <div className="space-y-2 mb-5">
              <h3 className="text-base font-bold flex items-center gap-2">
                {isLast ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : isFirst ? (
                  <Sparkles size={18} className="text-accent" />
                ) : null}
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted dark:text-muted-dark leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle dark:border-border-subtle-dark">
              <button
                onClick={handleSkip}
                className="text-xs font-medium text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark px-2 py-1.5 rounded transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark hover:bg-elevated dark:hover:bg-elevated-dark transition-colors"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
                <button
                  onClick={isLast ? handleComplete : handleNext}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white shadow-sm transition-all"
                >
                  {isFirst ? (
                    "Start Tour"
                  ) : isLast ? (
                    "Get Started!"
                  ) : (
                    <>
                      Next <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
