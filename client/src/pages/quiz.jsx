import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";

function Quiz() {
  const { quizQuestions, submitQuiz } = useCourses();
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const result = submitQuiz(answers);
    setScore(result);
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="quiz-page">
          <Link className="back-button" to="/">
            ⬅️ Back to Dashboard
          </Link>

          <p className="eyebrow">Knowledge Check</p>
          <h1>Web Development basics</h1>
          <p className="muted">Answer each question, then submit your quiz.</p>

          <form onSubmit={handleSubmit}>
            {quizQuestions.map((ques, index) => (
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
                      checked={Number(answers[index]) === optIndex}
                      onChange={(event) =>
                        setAnswers({
                          ...answers,
                          [index]: event.target.value,
                        })
                      }
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}

            {score !== null && (
              <div className="quiz-result">
                You scored {score} out of {quizQuestions.length}.
                {score === quizQuestions.length
                  ? " Great work! Quiz marked as completed."
                  : " Review the chapters and try again."}
              </div>
            )}

            <button className="primary-button" type="submit">
              Submit Quiz
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Quiz;
