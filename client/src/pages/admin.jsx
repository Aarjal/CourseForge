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
            
        </section>
    )
}