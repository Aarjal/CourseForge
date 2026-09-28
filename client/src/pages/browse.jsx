import Coursecard from "../components/courseCard";


// create the func to create the browse page in the website
function Browse({
    courses_study,
    search,
    setSearch,
    chap_progress,
    setSelecCourseId,
    setScreen,
}){
    // search course using filter and lowercasing the input
     const visible_courses=courses_study.filter((course)=>
    course.published !== false &&
    course.name.toLowerCase().includes(search.toLowerCase()),
    )

    function open_course(course_id){
        setSelecCourseId(course_id)
        setScreen('course')
    }

    return(
        <section className="browse-page">
            <button className="back-button"
            onClick={()=>setScreen('home')} type="button">Back to Dashboard</button>
            <div className="section-head">
                <div>
                    <p className="eye">
                        Course Library
                    </p>
                    <h1>Browse Courses</h1>
                    <p className="muted">
                        Find a practical course and start learning. 
                    </p>

                </div>
            </div>

            <input className="search-input" type="search" 
            value={search} onChange={(event)=>
                setSearch(event.target.value)
            }
            placeholder="Search Courses"
            aria-label="Search Courses"/>

            {visible_courses.length===0 ? (
                <div className="empty-state">
                    <h3>No courses found</h3>
                    <p>Try searching for a different course. </p>
                </div>
            ):(
                <div className="course-grid">
                    {visible_courses.map((course)=>(
                        <Coursecard key={course.id}
                        course={course}
                        progress={chap_progress(course)}
                        onOpen={()=>open_course(course.id)}/>
                    ))}
                </div>
            )}
        </section>
    )
}


export default Browse