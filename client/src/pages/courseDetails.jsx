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
                {done_enroll}
            </div>
        </section>
    )
}