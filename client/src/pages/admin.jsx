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
    const [published, setPublished]=useState(false)
    const [message, setMessage]= useState('')

    // update course
    function upd_course(event){
        setCourseForm({
            ...course_form,
            [event.target.name]: event.target.value,
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
    function add_chap(event){
        event.preventDefault()

        if(!chapter_form.title || !chapter_form.duration){
            setMessage('Add a chapter title and duration. ')
            return
        }
        setDraftChapters([
            ...draft_chap,{
                id:draft_chap.length++,
                title: chapter_form.title,
                duration: chapter_form.duration,
                preview: chapter_form.preview,
                type: 'Theory',
            }
        ])

        setChapterForm({
            title:'',
            duration:'',
            preview:true
        })

        setMessage('')
    }

// save coursedata
    function save_course(event){
        event.preventDefailt()
         
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
                Add course info ad build the chapter list. 
            </p>

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
                    onVolumeChange={upd_course}
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




        </section>
    )
}