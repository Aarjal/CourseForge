import Coursecard from "../components/courseCard";

function Home({
  app_state,
  screen,
  setScreen,
  handle_logout_event,
  courses_study,
  chap_progress,
  setSelecCourseId,
  submit_quiz,
  quizques,
  ans,
  setAns,
  quiz_res,
}) {
  return (
    <div className="app-shell">
      <header className="top">
        <button className="wordmark" onClick={() => setScreen('home')} type="button">
          <img
            className="site-logo"
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt="CourseForge logo"
          />
          <span className="site-name">CourseForge</span>
        </button>

        <nav>
          <button
            className={screen === 'home' ? 'active' : ''}
            onClick={() => setScreen('home')}
            type="button"
          >
            Home
          </button>

          <button
            className={screen === 'browse' ? 'active' : ''}
            onClick={() => setScreen('browse')}
            type="button"
          >
            Browse courses
          </button>

          <button onClick={handle_logout_event} type="button">
            Logout
          </button>
          <button
            className={screen === 'admin' ? 'active' : ''}
            onClick={() => setScreen('admin')}
            type="button"
          >
            Admin
          </button>
        </nav>
      </header>

      <main className="main-content">
        {screen === 'home' && (
          <>
            <section className="welcome-sec">
              <div>
                <p className="eye">STUDENT DASHBOARD </p>
                <h1>Keep Learning, Keep Growing, Keep Achieving</h1>
                <p className="muted">Your enrolled courses and current progress.</p>
              </div>

              <button className="primary-but" onClick={() => setScreen('browse')} type="button">
                Explore Courses
              </button>
            </section>
            <section className="stats-row">
              <div>
                <strong>
                  {Object.values(app_state.completed_chap).flat().length}
                </strong>
                <span>Completed Chapters</span>
              </div>
              <div>
                <strong>
                  {app_state.quiz_done ? '1' : '0'}
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

              {app_state.en_courses.length === 0 ? (
                <div className="empty-state">
                  <h3>No courses yet</h3>
                  <p>Explore the course library and start your first course.</p>
                  <button className="sec-button" onClick={() => setScreen('browse')} type="button">
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="course-grid">
                  {courses_study
                    .filter((course) => app_state.en_courses.includes(course.id))
                    .map((course) => (
                      <Coursecard
                        key={course.id}
                        course={course}
                        progress={chap_progress(course)}
                        onOpen={() => {
                          setSelecCourseId(course.id);
                          setScreen('course');
                        }}
                      />
                    ))}
                </div>
              )}
            </section>
          </>
        )}

        {screen === 'quiz' && (
          <section className="quiz-page">
            <button
              className="back-button"
              onClick={() => setScreen('home')}
              type="button"
            >
              ⬅️Back to Dashboard
            </button>

            <p className="eyebrow">Knowledge Check</p>
            <h1>Web Development basics</h1>
            <p className="muted">Answer each question, then submit your quiz.</p>

            <form onSubmit={submit_quiz}>
              {quizques.map((ques, index) => (
                <fieldset key={ques.question}>
                  <legend>
                    {index + 1}. {ques.question}
                  </legend>

                  {ques.options.map((option, optIndex) => (
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
  );
}

export default Home;
