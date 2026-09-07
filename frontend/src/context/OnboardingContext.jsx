import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const OnboardingContext = createContext(null);

export const DEMO_APPLICATIONS = [
  {
    id: 9901,
    company: "Google",
    role: "Senior Frontend Engineer",
    status: "Interview",
    postingUrl: "https://careers.google.com",
    notes: "Technical interview scheduled. Reviewed React & System Design.",
    tags: ["React", "Full-Time", "Tier 1"],
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    activityLogs: [
      { id: 991, note: "Recruiter screen completed successfully.", createdAt: new Date().toISOString() },
    ],
    attachments: [
      { id: 991, filename: "Resume_Tech.pdf", url: "#" },
    ],
  },
  {
    id: 9902,
    company: "Stripe",
    role: "Full Stack Engineer",
    status: "OA",
    postingUrl: "https://stripe.com/jobs",
    notes: "Completed Online Assessment. Waiting for team callback.",
    tags: ["API", "Node.js", "Remote"],
    followUpDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date().toISOString(),
    activityLogs: [],
    attachments: [],
  },
  {
    id: 9903,
    company: "Airbnb",
    role: "Product UI Developer",
    status: "Applied",
    postingUrl: "https://airbnb.com/careers",
    notes: "Applied via internal referral.",
    tags: ["Design System", "Tailwind"],
    followUpDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    createdAt: new Date().toISOString(),
    activityLogs: [],
    attachments: [],
  },
  {
    id: 9904,
    company: "Vercel",
    role: "Staff Software Engineer",
    status: "Offer",
    postingUrl: "https://vercel.com/careers",
    notes: "Received offer package! Reviewing equity options.",
    tags: ["Next.js", "High Priority"],
    followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date().toISOString(),
    activityLogs: [],
    attachments: [],
  },
];

export const DEMO_CONTACTS = [
  {
    id: 9901,
    name: "Sarah Jenkins",
    role: "Technical Recruiter",
    company: "Google",
    email: "sarah.j@google.com",
    notes: "Reached out via LinkedIn regarding Senior Frontend role.",
    applicationId: 9901,
    application: { id: 9901, company: "Google", role: "Senior Frontend Engineer" },
  },
  {
    id: 9902,
    name: "Alex Rivera",
    role: "Engineering Manager",
    company: "Stripe",
    email: "alex@stripe.com",
    notes: "Met at React Tech Conference. Great discussion on API architecture.",
    applicationId: 9902,
    application: { id: 9902, company: "Stripe", role: "Full Stack Engineer" },
  },
];

export const DEMO_CALENDAR_EVENTS = [
  {
    id: 9901,
    company: "Google",
    role: "Senior Frontend Engineer",
    status: "Interview",
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 9902,
    company: "Stripe",
    role: "Full Stack Engineer",
    status: "OA",
    followUpDate: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
  {
    id: 9904,
    company: "Vercel",
    role: "Staff Software Engineer",
    status: "Offer",
    followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  },
];

export const DEMO_GOAL_STATS = {
  thisWeekCount: 4,
  weeklyGoal: 5,
};

export const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome! Let's take a quick tour 👋",
    description:
      "Let's walk through the key features of JobTrack in a clear, natural workflow.",
    target: null, // Modal centered
    route: "/",
    view: "list",
    workflowBadge: "Overview",
  },
  {
    id: "applications",
    title: "1. Applications — The Core System",
    description:
      "Applications are at the heart of JobTrack. Here you can create, manage, and track all your job opportunities.",
    target: '[data-tour="nav-applications"]',
    route: "/",
    view: "list",
    workflowBadge: "Applications Core",
  },
  {
    id: "add-application",
    title: "2. Add a New Application",
    description:
      "Easily create a new entry by adding the company name, role, status, posting link, and custom tags.",
    target: '[data-tour="add-application"]',
    route: "/",
    view: "list",
    workflowBadge: "Add Application",
  },
  {
    id: "kanban",
    title: "3. Track Progress (Kanban Board)",
    description:
      "Use the Kanban board to track your applications visually through their different status stages.",
    target: '[data-tour="view-kanban"]',
    route: "/",
    view: "kanban",
    workflowBadge: "Kanban Board",
  },
  {
    id: "analytics",
    title: "4. Analytics & Insights",
    description:
      "The analytical view provides deep metrics on your applications: status breakdown, response rates, and weekly goal progress.",
    target: '[data-tour="view-analytics"]',
    route: "/",
    view: "analytics",
    workflowBadge: "Analytics View",
  },
  {
    id: "contacts",
    title: "5. Contacts & Network",
    description:
      "Contacts allows you to keep track of recruiters, interviewers, and referrals associated with your job search.",
    target: '[data-tour="nav-contacts"]',
    route: "/contacts",
    workflowBadge: "Contacts System",
  },
  {
    id: "connect-contacts",
    title: "6. Add Contact & Link to Applications",
    description:
      "Add new networking contacts and link them directly to specific job applications to see who is associated with each job.",
    target: '[data-tour="add-contact"]',
    route: "/contacts",
    workflowBadge: "App ➔ Linked Contact",
  },
  {
    id: "calendar-nav",
    title: "7. Open Calendar",
    description:
      "Access your synced upcoming dates, interviews, and deadlines directly from the Calendar menu.",
    target: '[data-tour="nav-calendar"]',
    route: "/calendar",
    workflowBadge: "Calendar Menu",
  },
  {
    id: "calendar-list",
    title: "8. Calendar View 1 — List View",
    description:
      "List View groups all your upcoming interviews, follow-ups, and deadlines in a clean, chronological list.",
    target: '[data-tour="calendar-view-list"]',
    route: "/calendar",
    calendarView: "list",
    workflowBadge: "Calendar List View",
  },
  {
    id: "calendar-grid",
    title: "9. Calendar View 2 — Traditional Grid View",
    description:
      "Switch to the Traditional Grid View to view your dates across a full monthly calendar grid layout.",
    target: '[data-tour="calendar-view-grid"]',
    route: "/calendar",
    calendarView: "grid",
    workflowBadge: "Calendar Grid View",
  },
  {
    id: "together",
    title: "10. Bring Everything Together 🚀",
    description:
      "Applications connect to Contacts, dates sync to your Calendar, progress moves through the Kanban board, and Analytics gives you deep insights!",
    target: null, // Modal centered
    route: "/",
    view: "list",
    workflowBadge: "Complete Workflow",
  },
];

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem("jobtrack_onboarding_completed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (user && !hasCompletedOnboarding && !isActive) {
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 600);
      return () => clearTimeout(timer);
    }
    if (!user && isActive) {
      setIsActive(false);
    }
  }, [user, hasCompletedOnboarding, isActive]);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const skipTour = () => {
    setIsActive(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem("jobtrack_onboarding_completed", "true");
    } catch {}
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem("jobtrack_onboarding_completed", "true");
    } catch {}
  };

  const isDemoActive = isActive;

  const demoData = {
    applications: DEMO_APPLICATIONS,
    contacts: DEMO_CONTACTS,
    calendarEvents: DEMO_CALENDAR_EVENTS,
    goalStats: DEMO_GOAL_STATS,
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        isDemoActive,
        demoData,
        currentStepIndex,
        currentStep: TOUR_STEPS[currentStepIndex],
        totalSteps: TOUR_STEPS.length,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
