// <!-- make simple login page -->
function Login({handle_login_event, loginerr}) {
    return (
<main className="login-page">

    <section className="login-panel">
        <div className="brand-mark">CF</div>
        <p className="eye">COURSEFORGE</p>
        <h1>Build Your Future with skills that move you forward</h1>
        <p className="muted">
            A focused learning space for practical courses that help you build your career.
        </p>

        <form onSubmit= {handle_login_event} className="login-form">
            <label>Email
                <input type="email" name="email" placeholder="student@courseforge.com" required />
            </label>
            <label>Password
                <input type="password" name="password" placeholder="********" required />
            </label>
            {loginerr && <p className="error">{loginerr}</p>}

            <button className="primary-button" type="submit">
                Enter CourseForge
            </button>
        </form>

        {/* <!-- note:::::::: remove in other ship(make it a real app) --> */}
        <p className="note">
            It is a demo mode:: any email or password will work for this ship. 
        </p> 

    </section>
</main>
    )
}


export default Login;