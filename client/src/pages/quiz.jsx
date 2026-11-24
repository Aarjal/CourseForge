import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";

function Quiz() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  const {
    courses,
    quizQuestions,
    submitQuiz,
    getQuizByCourse,
    getQuizAttempts,
  } = useCourses();

  const [loading, setLoading] = useState(Boolean(courseId));
  const [quiz, setQuiz] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadQuizData() {
      if (!courseId) {
        // Fallback to legacy default quiz
        setQuiz({
          title: "Web Development Basics Quiz",
          description: "Answer each question, then submit your quiz to test your comprehension.",
          passingScore: 80,
          questions: quizQuestions.map((q, idx) => ({
            id: `q-${idx}`,
            question: q.question,
            options: q.options,
          })),
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const foundCourse = courses.find((c) => String(c.id) === String(courseId));
      if (foundCourse) {
        setCurrentCourse(foundCourse);
      }

      try {
        const [courseQuiz, attempts] = await Promise.all([
          getQuizByCourse(courseId),
          getQuizAttempts(courseId).catch(() => []),
        ]);

        if (!isCancelled) {
          if (courseQuiz && courseQuiz.questions && courseQuiz.questions.length > 0) {
            setQuiz(courseQuiz);
          } else {
            setQuiz(null);
          }
          setPastAttempts(attempts || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load quiz for this course");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadQuizData();

    return () => {
      isCancelled = true;
    };
  }, [courseId, courses, quizQuestions, getQuizByCourse, getQuizAttempts]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;

    // Check if at least some answers were provided
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      const confirmIncomplete = window.confirm(
        `You have answered ${answeredCount} of ${quiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmIncomplete) return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await submitQuiz(courseId || null, answers);
      setResult(response);

      // Refresh attempts
      if (courseId) {
        const updatedAttempts = await getQuizAttempts(courseId).catch(() => []);
        setPastAttempts(updatedAttempts);
      }
    } catch (err) {
      setError(err.message || "Failed to submit quiz. Please ensure you are enrolled.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setError("");
  }

  const backLink = courseId ? `/courses/${courseId}` : "/";
  const backLabel = courseId ? `⬅️ Back to ${currentCourse?.title || "Course"}` : "⬅️ Back to Dashboard";

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="quiz-page">
          <Link className="back-button" to={backLink}>
            {backLabel}
          </Link>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p className="muted">Loading quiz assessment...</p>
            </div>
          ) : !quiz ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p className="eyebrow">Assessment</p>
              <h2>No Quiz Available</h2>
              <p className="muted" style={{ margin: "16px 0 24px" }}>
                An assessment has not been published for this course yet.
              </p>
              <Link className="primary-button" to={backLink}>
                Return to Course
              </Link>
            </div>
          ) : (
            <>
              <p className="eyebrow">
                {currentCourse ? currentCourse.title : "Knowledge Check"}
              </p>
              <h1>{quiz.title || "Course Quiz"}</h1>
              <p className="muted">
                {quiz.description || "Answer each question, then submit your quiz."}{" "}
                Passing score requirement: <strong>{quiz.passingScore || 80}%</strong>.
              </p>

              {error && (
                <div className="error" style={{ margin: "16px 0" }}>
                  {error}
                </div>
              )}

              {result ? (
                /* ================= QUIZ RESULT & DETAILED BREAKDOWN ================= */
                <div className="quiz-results-container" style={{ margin: "24px 0" }}>
                  <div
                    className={result.passed ? "quiz-banner pass" : "quiz-banner fail"}
                  >
                    <div style={{ fontSize: "28px" }}>
                      {result.passed ? "🎉" : "📚"}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px" }}>
                        {result.passed
                          ? "Congratulations, you passed!"
                          : "Did not meet passing score"}
                      </h3>
                      <p style={{ margin: 0 }}>
                        Score: <strong>{result.score}</strong> /{" "}
                        {result.totalQuestions || result.total} (
                        <strong>{result.percentage}%</strong>) — Required to pass:{" "}
                        {quiz.passingScore || 80}%.
                      </p>
                    </div>
                  </div>

                  {result.results && result.results.length > 0 && (
                    <div className="quiz-breakdown" style={{ marginTop: "32px" }}>
                      <h3>Question Review</h3>
                      {quiz.questions.map((ques, index) => {
                        const answerDetail = result.results[index] || {};
                        const isCorrect = answerDetail.isCorrect;
                        const userSelected = answerDetail.selectedOption;
                        const correctOpt = answerDetail.correctAnswer;

                        return (
                          <div
                            className={`quiz-review-card ${isCorrect ? "correct" : "wrong"}`}
                            key={ques.id || index}
                            style={{
                              margin: "20px 0",
                              padding: "20px",
                              border: "1px solid var(--line)",
                              borderRadius: "6px",
                              background: "var(--paper)",
                            }}
                          >
                            <p style={{ fontWeight: "700", marginBottom: "12px" }}>
                              {index + 1}. {ques.question}{" "}
                              {isCorrect ? (
                                <span style={{ color: "var(--green)", marginLeft: "8px" }}>
                                  ✓ Correct
                                </span>
                              ) : (
                                <span style={{ color: "#d9383a", marginLeft: "8px" }}>
                                  ✕ Incorrect
                                </span>
                              )}
                            </p>

                            <div style={{ display: "grid", gap: "8px" }}>
                              {ques.options.map((option, optIdx) => {
                                const isUserChoice = userSelected === optIdx;
                                const isActualCorrect = correctOpt === optIdx;

                                let itemStyle = {
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--line)",
                                  fontSize: "14px",
                                };

                                if (isActualCorrect) {
                                  itemStyle = {
                                    ...itemStyle,
                                    borderColor: "var(--green)",
                                    background: "var(--green-soft)",
                                    fontWeight: "600",
                                    color: "var(--green)",
                                  };
                                } else if (isUserChoice && !isCorrect) {
                                  itemStyle = {
                                    ...itemStyle,
                                    borderColor: "#d9383a",
                                    background: "#fde8e8",
                                    fontWeight: "600",
                                    color: "#d9383a",
                                  };
                                }

                                return (
                                  <div key={optIdx} style={itemStyle}>
                                    <span>{option}</span>
                                    {isUserChoice && (
                                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                                        (Your Answer)
                                      </span>
                                    )}
                                    {isActualCorrect && !isUserChoice && (
                                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                                        (Correct Answer)
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {answerDetail.explanation && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "10px",
                                  background: "rgba(0,0,0,0.03)",
                                  borderLeft: "3px solid var(--green)",
                                  fontSize: "13px",
                                  color: "var(--ink)",
                                }}
                              >
                                💡 <strong>Explanation:</strong> {answerDetail.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button
                      className="primary-button"
                      onClick={handleRetake}
                      type="button"
                    >
                      Retake Quiz
                    </button>
                    <Link className="secondary-button" to={backLink}>
                      {courseId ? "Back to Course" : "Back to Dashboard"}
                    </Link>
                  </div>
                </div>
              ) : (
                /* ================= QUIZ FORM ================= */
                <form onSubmit={handleSubmit}>
                  {quiz.questions.map((ques, index) => (
                    <fieldset key={ques.id || ques.question || index}>
                      <legend>
                        {index + 1}. {ques.question}
                      </legend>

                      {ques.options.map((option, optIndex) => (
                        <label className="option" key={optIndex}>
                          <input
                            checked={Number(answers[index]) === optIndex}
                            name={`question-${index}`}
                            onChange={(event) =>
                              setAnswers({
                                ...answers,
                                [index]: Number(event.target.value),
                              })
                            }
                            type="radio"
                            value={optIndex}
                          />
                          {option}
                        </label>
                      ))}
                    </fieldset>
                  ))}

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                      className="primary-button"
                      disabled={submitting}
                      type="submit"
                    >
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>

                    {courseId && (
                      <Link className="secondary-button" to={backLink}>
                        Cancel
                      </Link>
                    )}
                  </div>
                </form>
              )}

              {/* Past Attempts summary if available */}
              {pastAttempts && pastAttempts.length > 0 && !result && (
                <div
                  style={{
                    marginTop: "48px",
                    padding: "20px",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <p className="eyebrow">History</p>
                  <h3>Previous Attempts</h3>
                  <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                    {pastAttempts.map((att, idx) => (
                      <div
                        key={att._id || att.id || idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: "var(--paper)",
                          border: "1px solid var(--line)",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      >
                        <span>
                          Attempt {pastAttempts.length - idx} &bull;{" "}
                          <strong
                            style={{
                              color: att.passed ? "var(--green)" : "#d9383a",
                            }}
                          >
                            {att.passed ? "Passed" : "Did Not Pass"}
                          </strong>
                        </span>
                        <span>
                          Score: {att.score} / {att.totalQuestions} ({att.percentage}%) &bull;{" "}
                          {new Date(att.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Quiz;
