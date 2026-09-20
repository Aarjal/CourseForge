
function Home({app_state,
  screen,
  setScreen,
  handle_logout_event,
  courses_study,
  chap_progress,
  setSelecCourseId,
  selected_course,
  enroll_course,
  chap_comp,
  submit_quiz,
  quizques,
  ans,
  setAns,
    quiz_res,
    search,
    setSearch,
}) {
// <!-- make simple home page -->
    const visible_courses = courses_study.filter((course) =>
        course.name.toLowerCase().includes(search.toLowerCase()),
    )

return(
<div className="app-shell">
    <header className="top">
        {/* <!-- logo///nav --> */}
        <button className="wordmark" onClick={() => setScreen('home')} type="button">
            <img className="site-logo" src="/logo.png" alt="CourseForge logo" />
            <span className="site-name">CourseForge</span>
        </button>

        <nav>
            <button className= {screen === 'home' ? 'active':''}
                onClick={()=>setScreen('home')} type="button">
                Home
            </button>

            <button className= {screen === 'browse' ? 'active':''}
                onClick={()=>setScreen('browse')} type="button">
                Browse courses
            </button>

            <button onClick={handle_logout_event} type="button">
                Logout
            </button>
        </nav>




    </header>

    <main className="main-content">
        {/* <!-- main cnt for home(to be updated in future) --> */}
        {screen === 'home'&& (

        <>        
            {/* <!-- "<>" helps to group children without extra tags like div..... --> */}
        <section className="welcome-sec">
            
            <div>
                <p className="eye">STUDENT DASHBOARD </p>
                <h1>Keep Learning, Keep Growing, Keep Achieving</h1>
                <p className="muted">Your enrolled courses and current progress.</p>

            </div>


            <button className="primary-but" onClick={()=> setScreen('browse')} type="button">
                Explore Courses
            </button>
            
        </section>
        <section className="stats-row">
            <div>
                <strong>
                    {/* display the total number of completed chapters across all categories flattening data*/}
                    {Object.values(app_state.completed_chap).flat().length}
                </strong>
                <span>Completed Chapters</span>
            </div>
            <div>
                <strong>
                    {/* 1== completed 2== not completed */}
                    {app_state.quiz_done? "1":"0"}
                </strong>
                <span>Quizzes Completed</span>
            </div>
        </section>

        <section>
            <div className="section-head">
                <div>
                    <p className="eye">Your Learning</p>
                    <h2>Continue Learning</h2>
                </div>
            </div>
            
{/* if no enrolled courses then tell to explore cources  */}
            {app_state.en_courses.length ===0?(
                <div className="empty-state">
                    <h3>No courses yet</h3>
                    <p>Explore the course library and start your first course.</p>
                    <button className="sec-button" onClick={()=> setScreen('browse')}>
                        Browse Courses
                    </button>
                </div>
            ):(
        // <!-- else display the enrolled courses if someon has enrolled before by filtering it using map  -->
                <div className="course-grid">
                    {courses_study.filter((course)=>
                        app_state.en_courses.includes(course.id),
                    ).map((course)=>(
                        <Coursecard key={course.id} course={course} progress={chap_progress(course)}
                        onOpen={() => {
                          setSelecCourseId(course.id)
                          setScreen('course')
                        }}  />
                    ))}
                </div>
            )}
            </section>
        </>
        )}

        {screen === 'browse' && (
            <section>
                <div className="section-head">
                    <p className="eye">Course Library</p>
                    <h1>Browse Courses</h1>
                </div>
                <input
                    className="search-input"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search courses"
                    aria-label="Search courses"
                />
                {visible_courses.length === 0 ? (
                    <div className="empty-state">
                        <h3>No matching courses</h3>
                        <p>Try a different search term.</p>
                    </div>
                ) : (
                    <div className="course-grid">
                        {visible_courses.map((course) => (
                            <Coursecard
                                key={course.id}
                                course={course}
                                progress={chap_progress(course)}
                                onOpen={() => {
                                    setSelecCourseId(course.id)
                                    setScreen('course')
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
        )}

                {screen==='course' && selected_course && (
    
                    <>
                        <button className="back-button" 
                        onClick={() => setScreen('browse')}
                        type="button" >
                            ⬅️Back to courses
                        </button>

                        <section className="course-hero">
                            <div>
                                {/* <!-- display the course type --> */}
                                <p className="eye"> {selected_course.category}</p>
                                <h1>{selected_course.name}</h1>
                                <p className="muted">{selected_course.desc}</p>
                                <span className="tag">{selected_course.level}</span>
                            </div>



                 {/* <!-- tell to enroll if not enrolled --> */}
                            {!app_state.en_courses.includes(selected_course.id) ?(
                                <button className="primary-button" 
                                onClick={()=> enroll_course(selected_course.id)}
                                type="button">
                                    Enroll in this course
                                </button>

                            ):(
                                <div className="enrolled-label">Enrolled</div>
                            )}
                        </section>

{/* <!-- display chapter list --> */}
                        <section className="chapter-section">
                            <div className="section-head">
                                <div>
                                    <p className="eye">Course Content</p>
                                    <h2>Chapters</h2>
                                </div>
                                <strong>{chap_progress(selected_course)}% complete</strong>
                            </div>

                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${chap_progress(selected_course)}%` }}>

                                </div>

                            </div>

                            <div className="chapter-list">
                                {selected_course.chapters.map((chapter,index)=>{
                                    const isEnrolled= app_state.en_courses.includes(selected_course.id,)
                                    const isComplete= app_state.completed_chap[selected_course.id]?.includes(chapter.id,) ?? false
                                    const isLocked= !chapter.preview && !isEnrolled

                                    return(
                                        <div className="chapter-row" key={chapter.id}>
                                            <div className="chapter-number">0{index+1}</div>

                                            <div className="chapter-info">
                                                <strong>{chapter.title}</strong>
                                                <span>{chapter.duration}</span>
                                            </div>
                                            {isLocked ? (
                                                <span className="locked">Locked</span>
                                            ) : (
                                                <button className={isComplete ?'completed':'complete-button'}
                                                onClick={()=> chap_comp(selected_course.id, chapter.id)}
                                                type="button">
                                                    {isComplete ? 'Completed':'Mark as complete'}

                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>


                        </section>

 {/* add quiz logic here */}
                        <section className="quiz-callout">
                            <div>
                                <p className="eye">Test Your Knowledge</p>
                                <h2>Take the Quiz for what you've learned</h2>
                                <p className="muted">
                                 Complete a short quiz after studying the course.
                                </p>

                            </div>
                            <button
                            className="secondary-button"
                            onClick={()=> setScreen('quiz')}>
                                Take Quiz
                            </button>


                        </section>
                    </>              
                )}

                {screen=== 'quiz' &&(
                    <section className="quiz-page">
                        <button className="back-button"
                        onClick={()=> setScreen('course')}
                        type="button">
                            ⬅️Back to course
                        </button>

                        <p className="eyebrow">Knowledge Check</p>
                        <h1>Web Development basics</h1>
                        <p className="muted">Answer each question, then submit your quiz.</p>

                        {/* <!-- validate answers --> */}
                        <form onSubmit={submit_quiz}>
                            {quizques.map((ques,index)=>(
                                <fieldset key={ques.question}>
                                    <legend>
                                        {index+1}. {ques.question}
                                    </legend>

                                    {ques.options.map((option, optIndex)=>(
                                        <label className="option" key={option}>
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={optIndex}
                                                onChange={(event) =>
                                                        setAns({
                                                            ...ans,
                                                            [index]: event.target.value,
                                                        })
                                                        }
                                            />

                                            {option}
                                        </label>
                                    ))}
                                </fieldset>
                            ))}
                            {quiz_res != null && (
                                <div className="quiz-result">
                                    You scored {quiz_res} out of {quizques.length}.
                                    {quiz_res === quizques.length
                                        ? ' Great work!'
                                        : ' Review the chapters and try again.'}
                                </div>
                            )}
                            <button className="primary-button" type="submit">
                                Submit Quiz
                            </button>
                            


                        </form>
                    </section>
                )}

    </main>

</div>
)
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

export default Home;