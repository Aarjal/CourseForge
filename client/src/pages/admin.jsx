import { useState } from "react";

// add admin functionality
function Admin({courses_study,
    setCoursesStudy,
    setScreen
}){
    const [course_form, setCourseForm]=useState({
        name:'',
        category:'Development',
        level: 'Beginner',
        desc:'',
    })

    const[chapter_form,setChapterForm]= useState({
        title: '',
        duration:'',
        preview: true
    })

    const [draft_chap,setDraftChapters]= useState([])
    const [chapter_target, setChapterTarget] = useState('new')
    const [published, setPublished]=useState(false)
    const [message, setMessage]= useState('')

    // update course
    function upd_course(event){
        const { name, value } = event.target

        setCourseForm({
            ...course_form,
            [name]: value,
        })
    }

// update chapter
    function upd_chap(event){
        const value= 
        event.target.type==='checkbox'
        ? event.target.checked
        :event.target.value
        
        setChapterForm({
            ...chapter_form,
            [event.target.name]: value,
        })
    }

    // add chapter
    function add_chap(event) {
  event.preventDefault()

  if (!chapter_form.title || !chapter_form.duration) {
    setMessage('Add a chapter title and duration.')
    return
  }

  const new_chapter = {
    title: chapter_form.title,
    duration: chapter_form.duration,
    preview: chapter_form.preview,
    type: 'Theory',
  }

  if (chapter_target !== 'new') {
    const target_id = Number(chapter_target)

    const updated_courses = courses_study.map((course) => {
      if (course.id !== target_id) {
        return course
      }

      const existing_chapters = course.chapters || []

      const next_id =
        existing_chapters.reduce(
          (highest_id, chapter) => Math.max(highest_id, Number(chapter.id)),
          0,
        ) + 1

      return {
        ...course,
        chapters: [
          ...existing_chapters,
          {
            ...new_chapter,
            id: next_id,
          },
        ],
      }
    })

    setCoursesStudy(updated_courses)
    setMessage('Chapter added to the selected course.')
  } else {
    setDraftChapters([
      ...draft_chap,
      {
        ...new_chapter,
        id: draft_chap.length + 1,
      },
    ])

    setMessage('Chapter added to the new course draft.')
  }

  setChapterForm({
    title: '',
    duration: '',
    preview: true,
  })
}
// save coursedata
    function save_course(event){
        event.preventDefault()
         
        if(!course_form.name||!course_form.desc){
            setMessage('Add a course name and description.')
            return
        }

        const new_course={
            id: Date.now(),
            ...course_form,
            published,
            chapters: draft_chap,
            challenge:[],
        }

        setCoursesStudy([...courses_study,new_course])
        setMessage('Course saved successfully.')
        setCourseForm({
            name:'',
            category:'Development',
            level:'Beginner',
            desc:''
        })
        setDraftChapters([])
        setChapterTarget('new')
        setPublished(false)
    }

    return(
        <section className="admin-page">
            <button className="back-button"
            onClick={()=>setScreen('home')}               
            type="button">
                Back to Dashboard
            </button>
            <p className="eye">Admin tools</p>
            <h1>Create a course</h1>
            <p className="muted">
                Add course info and build the chapter list. 
            </p>

{/* add the form to handle and update data */}
            <form className="admin-form" onSubmit={save_course}>
                <label>
                    Course Name<input
                    name="name"
                    value={course_form.name}
                    onChange={upd_course}
                    placeholder="eg: html basics"/>

                </label>
                <label>
                    Description
                    <textarea
                    name="desc"
                    value={course_form.desc}
                    onChange={upd_course}
                    placeholder="Descrie what will learner and students learn???"/>

                </label>

                <label>
                    Category
                    <input
                    name="category"
                    value={course_form.category}
                    onChange={upd_course}/>


                </label>

                <label>
                    Level
                    <select
                    name="level"
                    value={course_form.level}
                    onChange={upd_course}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        
                    </select>
                </label>

                <label className="checkbox-row">
                    <input 
                    name="published"
                    type="checkbox"
                    checked={published}
                    onChange={(event)=> setPublished(event.target.checked)}/>
                    Publish this course
                </label>

                <button className="primary-button" type="submit">
                    Save course
                </button>

            </form>

            <hr/>


            <h2>Add chapters</h2>

            <form className="admin-form" onSubmit={add_chap}>
                <label>
                    Insert Chapter into
                    <select value={chapter_target} 
                    onChange={(event)=> setChapterTarget(event.target.value)}>
                        <option value="new">New course draft</option>
                        {courses_study.map((course)=>(
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </label>
               
               
               
                <label>
                    Chapter title
                    <input 
                    name="title"
                    value={chapter_form.title}
                    onChange={upd_chap}
                    placeholder="eg:html tags"/>

                </label>

                <label>
                    Duration
                    <input name="duration" value={chapter_form.duration}
                    onChange={upd_chap}
                    placeholder="20 mins"
                    />
                </label>

                <label className="checkbox-row">
                    <input
                    name="preview"
                    type="checkbox"
                    checked={chapter_form.preview}
                    onChange={upd_chap}/>
                    Public preview

                </label>

                <button className="secondary-button" type="submit">
                    Add chapter
                </button>
            </form>

            {message
             && 
             <p className="form-message">{message}</p>
            }
            
            {draft_chap.length>0 && (
                <div className="chapter-list">
                    {draft_chap.map((chapter,index)=>(
                        <div className="chapter-row" key={chapter.id}>
                            <span className="chapter-num">
                                {String(index+1).padStart(2,'0')}
                            </span>
                            <div className="chapter-info">
                                <strong>{chapter.title}</strong>
                                <span>{chapter.duration}</span>
                            </div>
                            <span className="tag">
                                {chapter.preview ? 'Preview':'Locked'}
                            </span>
                        </div>
                    ))}
                </div>
            )}


        </section>
    )
}



export default Admin