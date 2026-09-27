// create a func for course details splitting the jobs

function CourseDetails({
    course,
    app_state,
    chap_progress,
    enroll_course,
    chap_comp,
    setScreen,
    setScreen,
}){
    // ret course isnt found iif there is no such courses
    if(!course){
        return(<div className="empty-state">
            <h3>Course not found</h3>
            <button className="secondary-button"
            onClick={()=>setScreen('browse')}
            type="button">
                Back to courses
            </button>
        </div>)
    }
// find enrolled courses
    const done_enroll=app_state.en_courses.incldes(course.id)
// ret the found corses
    return(
        <section className="course-details-page">
            <button className="back-button" onClick={()=> setScreen('browse')}
            type="button">
                Back to courses
            </button>

            <div className="course-hero">
                <div>
                    <p className="eye">{course.category}</p>
                    <h1>{course.name}</h1>
                    <p className="muted">{course.desc}</p>
                    <span className="tag">{course.level}</span>
                </div>
{/* if enrolled show the data */}
                {done_enroll ?(
                    <span className="enrolled-label">Enrolled</span>
                ):(
                    <button className="primary-button"
                    onClick={()=>enroll_course(course.id)}
                    type="button">Enroll In Course</button>
                )}
            </div>
{/* show course content .. */}
            <div className="section-head">
                <div>
                    <p className="eye">Course content</p>
                    <h2>Chapters</h2>
                </div>
                <strong>{chap_progress(course)}% complete</strong>
            </div>

            <div className="progress-track">
                <div className="progress-fill" style={{width:`${chap_progress(course)}%`}}/>
            </div>


{/* show chap list using the ccquired data and above vars.  */}
            <div className="chapter-list">
                {course.chapters.map((chapter,index)=>{
                    const completed=
                    app_state.completed_chap[course.id].incldes(chapter.id) ?? false

                    const locked= !chapter.preview && !done_enroll

                    return(
                        <div className="chapter-row" key={chapter.id}>
                            <div className="chapter-num">
                                {String(index++).padStart(2,'0')}
                            </div>

                            <div className="chapter-info">
                                <strong>{chapter.title}</strong>
                                <span>{chapter.duration}</span>

                            </div>

                            {locked ?(
                                <span className="locked">Locked</span>
                            ):(
                                <button className={completed ? 'completed' : 'complete-button'}
                                onClick={()=> chap_comp(course.id,chapter.id)}
                                type="button">
                                    {completed ? 'Completed' : 'Mark as completed'}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}



export default CourseDetails