export const DEFAULT_COURSES = [
  {
    id: 1,
    name: "Intro to Web Dev",
    category: "Development",
    level: "Beginner",
    desc: "Learn basics of web development by learning basic HTML and CSS. You will also learn how websites work and how to make your own website from scratch.",
    chapters: [
      {
        id: 1,
        title: "How web works??",
        duration: "15 mins",
        preview: true,
        type: "Theory",
      },
      {
        id: 2,
        title: "HTML foundations",
        duration: "20 mins",
        preview: false,
        type: "Theory",
      },
      {
        id: 3,
        title: "CSS foundations",
        duration: "25 mins",
        preview: false,
        type: "Theory",
      },
    ],
    challenge: [
      {
        id: 1,
        title: "Build a simple website using HTML and CSS",
        duration: "30 mins",
        preview: false,
        type: "Lab",
      },
    ],
  },
  {
    id: 2,
    name: "JS(javascript) essentials for beginners",
    category: "Programming",
    level: "Intermediate",
    desc: "Build strong foundation in JS variables, functions, arrays and events. You will also learn how to make your website interactive using JS.",
    chapters: [
      {
        id: 1,
        title: "Variables and Values",
        duration: "15 mins",
        preview: true,
        type: "Theory",
      },
      {
        id: 2,
        title: "Functions and Events",
        duration: "25 mins",
        preview: false,
        type: "Theory",
      },
      {
        id: 3,
        title: "Arrays and Loops",
        duration: "30 mins",
        preview: false,
        type: "Theory",
      },
      {
        id: 4,
        title: "Events and Interaction",
        duration: "28 mins",
        preview: false,
        type: "Theory",
      },
    ],
    challenge: [
      {
        id: 1,
        title: "Build a simple calc. using JS foundations.",
        duration: "30 mins",
        preview: false,
        type: "Lab",
      },
      {
        id: 2,
        title: "Build a website that takes input and validates it using JS (also use html and css)",
        duration: "40 mins",
        preview: false,
        type: "Lab",
      },
    ],
  },
];

export const DEFAULT_QUIZ_QUESTIONS = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "Hyperlinking Text Marking Language",
    ],
    ans: 0,
  },
  {
    question: "What does HTML define?",
    options: [
      "database",
      "Server Hardware",
      "Webpage Structure",
      "Webpage Design",
    ],
    ans: 2,
  },
  {
    question: "What is the correct HTML element for inserting a line break?",
    options: [
      "<break>",
      "<br>",
      "<lb>",
      "<line>",
    ],
    ans: 1,
  },
  {
    question: "What does CSS control?",
    options: [
      "HTML Structure",
      "HTML Content",
      "HTML Style",
      "HTML Functionality",
    ],
    ans: 2,
  },
  {
    question: "Which technology adds interactivity to a webpage?",
    options: [
      "HTML",
      "CSS",
      "Python",
      "JavaScript",
    ],
    ans: 3,
  },
];

const STATUS_KEY = "course-status";
const COURSES_KEY = "courseforge-courses";

export const initialStatus = {
  loggedin: false,
  user: null,
  en_courses: [],
  completed_chap: {},
  quiz_done: false,
};

export function getStoredStatus() {
  try {
    const saved = localStorage.getItem(STATUS_KEY);
    return saved ? { ...initialStatus, ...JSON.parse(saved) } : initialStatus;
  } catch {
    return initialStatus;
  }
}

export function saveStoredStatus(status) {
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error("Failed to save status to localStorage:", error);
  }
}

export function getStoredCourses() {
  try {
    const saved = localStorage.getItem(COURSES_KEY);
    if (!saved) return DEFAULT_COURSES;
    return JSON.parse(saved);
  } catch {
    return DEFAULT_COURSES;
  }
}

export function saveStoredCourses(courses) {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error("Failed to save courses to localStorage:", error);
  }
}
