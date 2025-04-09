"use client";

import { useEffect, useState } from "react";

export default function QnASection({ onBack }: { onBack: () => void }) {
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const sessionId = "SESSION_ID"; // Replace this with real ID logic later
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchQuestions = async () => {
    const res = await fetch(`/questions/${sessionId}`);
    const data = await res.json();
    setQuestions(data);
  };

  const submitQuestion = async () => {
    await fetch("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        question_text: questionText,
        is_anonymous: false,
      }),
    });
    setQuestionText("");
    fetchQuestions();
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 text-sm mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">❓ Q&A Section</h2>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={submitQuestion}
            className="bg-gradient-to-r from-blue-500 to-indigo-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
          >
            Submit
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Questions
        </h3>

        <ul className="space-y-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm text-gray-800 flex justify-between items-center"
            >
              <span>{q.question_text}</span>
              <span className="text-sm text-gray-500 ml-4">👍 {q.votes}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
