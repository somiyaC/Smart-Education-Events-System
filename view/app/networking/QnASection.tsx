"use client";

import { useEffect, useState } from "react";

export default function QnASection({ onBack }: { onBack: () => void }) {
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const sessionId = "SESSION_ID"; // You gotta replace with a real ID from the MongoDB
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

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
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Q&A Section</h2>
      <input
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Ask a question..."
        className="w-full border p-2 rounded mb-2"
      />
      <button onClick={submitQuestion} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
      <h3 className="text-xl mt-6 mb-2">Recent Questions</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id} className="border p-2 rounded mb-2">
            {q.question_text} 👍 {q.votes}
          </li>
        ))}
      </ul>
    </div>
  );
}
