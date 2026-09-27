
// create apis for coursese data calling 
const api_url= import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function parse_response(response) {
    const data= await response.json().catch(()=>null)



    if (!response.ok){
        throw new Error(data?.message || 'request failed')
    }
    return data
    
}

export async function get_courses(){
    const response= await fetch(`${api_url}/api/courses`)
    return parse_response(response)

}

export async function get_course(course_id) {
    const response= await fetch(`${api_url}/api/courses/${course_id}`)
    return parse_response(response)
}

export async function create_course(course_data) {
    
    const response= await fetch(`${api_url}/api/courses`,{
        method:'post',
        headers:{
            'content-type': 'applocation/json',
        },
        body: JSON.stringify(course_data),
        
    })
    return parse_response(response)
}


export async function update_course(course_id,course_data) {
    const response= await fetch(`${api_url}/api/courses/${course_id}`,{
        method: 'put',
        headers:{
            'content-type': 'application/json',
        },
        body: JSON.stringify(course_data),
    })
    return parse_response(response)
}

export async function delete_course(course_id) {
    const response= await fetch(`${api_url}/api/courses/${course_id}`,{
        method:'delete'
    })
    return parse_response(response)
}