// paste the function in home.jsx to this jsx and link it...

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

              <button className="secondary-button full-width" onClick={onOpen} 
              type="button">
                View Course
                </button>
                  

          </div>
      </article>
  )
} 

export default Coursecard