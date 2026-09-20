import { useState } from 'react'
import './App.css'

import Login from "../pages/login";
import Home from "../pages/home";


// add array of courses with chapters and challenges

const courses_study = [
    { id: 1, 
      name: "Intro to Web Dev", 
      category: "Development", 
      level: "Beginner", 
      desc:"Learn basics of web development by learning basic HTML and CSS.You will also learn how websites work and how to make own website from scratch. ",
      chapters: [
        {id:1,
          title:"How web works??",
          duration: "15 mins",
          preview:true,
          type:"Theory",
        },
        {
          id:2,
          title:"HTML foundations",
          duration: "20 mins",
          preview:false,
          type:"Theory",
        },
        {
          id:3,
          title:"CSS foundations",
          duration: "25 mins",
          preview:false,
          type:"Theory",
        },
      ],
      challenge:[
        {
          id:1,
          title:"Build a simple website using HTML and CSS",
          duration: "30 mins",
          preview:false,
          type:"Lab",
        },
      ],
    },
    { id: 2, 
      name: "JS(javascript) essentials for beginners", 
      category: "Programming", 
      level: "Intermediate", 
      desc:"Build strong foundation in Js variables, functions, arrays and events. You will also learn how to make your website interactive using JS.",
      chapters: [
        {id:1,
          title:"Variables and Values",
          duration: "15 mins",
          preview:true,
          type:"Theory",
        },
        {
          id:2,
          title:"Functions and Events",
          duration: "25 mins",
          preview:false,
          type:"Theory",
        },
        {
          id:3,
          title:"Arrays and Loops",
          duration: "30 mins",
          preview:false,
          type:"Theory",
        },
        {
          id:4,
          title: "Events and Interaction",
          duration: "28 mins",
          preview:false,
          type:"Theory",
        }
      ],
      challenge:[
        {
          id:1,
          title:"Build a simple calc. using JS foundations. ",
          duration: "30 mins",
          preview:false,
          type:"Lab",
        },
        {
          id:2,
          title:"Build a website that take input and validate it using JS (also use html and css) ",
          duration: "40 mins",
          preview:false,
          type:"Lab",
        }
      ]
    },
  ];

// quiz array
  const quizques=[

    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language",
        "Hyperlinking Text Marking Language"
      ],
      ans: 0
    },
    {
      question:"What does HTML define?",
      options:[
        "database",
        "Server Hardware",
        "Webpage Structure",
        "Webpage Design"
      ],
      ans:2
    },
    {
      question:"What is the correct HTML element for inserting a line break?",
      options:[
        "<break>",
        "<br>",
        "<lb>",
        "<line>"
      ],
      ans:1
    },
    {
      question:"What does CSS control?",
      options:[
        "HTML Structure",
        "HTML Content",
        "HTML Style",
        "HTML Functionality"
      ],
      ans:2
    },
    {
      question:"Which technology adds interactivity to a webpage?",
      options:[
        "HTML",
        "CSS",
        "Python",
        "JavaScript",
      ],
      ans:3
    }
  ]


  // get status from local storage so that backend is not required fot this ship(remove in other ship)
function get_saved_status(){
  const saved=localStorage.getItem("course-status");
  
  return saved ? JSON.parse(saved) : {
    loggedin: false,
    en_courses:[],
    completed_chap:{},
    quiz_done: false,
  };
}


  

//main app function 
function App() {
  const[app_state, setAppState]=useState(get_saved_status());
  const [screen, setScreen]=useState("login");
  const[selec_course_id, setSelecCourseId]=useState(null);
  const[search, setSearch]=useState("");
  const[loginerr, setLoginErr]=useState("");
  const[ans, setAns]=useState({});
  const[quiz_res, setQuizRes]=useState(null);

  const selected_course=courses_study.find(
    (course)=> course.id===selec_course_id,
  );


  function saveState(next_state){
    setAppState(next_state);
    localStorage.setItem("course-status", JSON.stringify(next_state));
  }

  function handle_login_event(event){
    event.preventDefault();

    const form_data= new FormData(event.target);
    const email=form_data.get("email");
    const password=form_data.get("password");

    if(!email || !password){
      setLoginErr("Enter an email and password to continue");
      return;
    }

    saveState({...app_state, loggedin:true});
    setScreen("home");
  }
    function handle_logout_event(){
      saveState({...app_state, loggedin:false});
      setScreen("login");
    }
  
  function enroll_course(course_id){
    if(app_state.en_courses.includes(course_id)){
      return;
    }
    saveState({
      ...app_state, 
      en_courses: [...app_state.en_courses, course_id]
    });

  }

  function chap_comp(course_id, chap_id){
    const progress=app_state.completed_chap[course_id] || [];

    if(progress.includes(chap_id)){
      return;
    }

    saveState({
      ...app_state,
      completed_chap:{...app_state.completed_chap,
        [course_id]: [...progress, chap_id],
      }
    })
  }

  function chap_progress(course){
    const finished=
    app_state.completed_chap[course.id]?.length || 0;

    return Math.round((finished/course.chapters.length)*100);
  }

  function submit_quiz(event){
    event.preventDefault();
    let sc=0;
    quizques.forEach((q,index)=>{
      if(Number(ans[index])===q.ans){
        sc++;
      }
    })
    setQuizRes(sc);

    if(sc=== quizques.length){
      saveState({...app_state, quiz_done:true});
    }
  }

  const courses_seen=courses_study.filter((course)=>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

        // link home.html and login.html

  if(!app_state.loggedin){
    return(
      <Login
      handle_login_event={handle_login_event}
      loginerr={loginerr} />

    )}

    return(<Home
      app_state={app_state}
      screen={screen}
      setScreen={setScreen}
      handle_logout_event={handle_logout_event}
      courses_study={courses_study}
      chap_progress={chap_progress}
      setSelecCourseId={setSelecCourseId}
      selected_course={selected_course}
      enroll_course={enroll_course}
      chap_comp={chap_comp}
      submit_quiz={submit_quiz}
      quizques={quizques}
      ans={ans}
      setAns={setAns}
      quiz_res={quiz_res}
      />)

  }

  

}




function Coursecard({course,progress,onOpen}){
  return(
      <article className="course-card">
          <div className="course-cover">
              <span>{course.category}</span>
              <strong>{course.id}</strong> 
          </div>

          <div className="course-card-content">
              <span className="tag">{course.level}</span>
              <h3>{course.name}</h3>
              <p>{course.desc}</p>

              <div className="card-meta">
                  <span>{course.chapters.length} chapters</span>
                  <span>{progress}% complete</span>
                  <span>{course.challenge.length} challenge</span>
              </div>

              <div className="progress-track">
                  {/* <!-- dont forget to add css for progress bar. its like battery indicator in mobile phones(the % of progres. is taken from  progress variable) --> */}
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>

              <button className="secondary-button full-width" onClick={onOpen}>View Course</button>
                  

          </div>
      </article>
  )
}

export default App
