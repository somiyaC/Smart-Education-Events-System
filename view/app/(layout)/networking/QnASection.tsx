"use client";

import { useEffect, useState } from "react";

interface QnASectionProps {
  onBack: () => void;
}

interface Question {
  _id: string;
  question: string;
  answers?: { user_id: string; text: string }[];
}

interface EventOption {
  id: string;
  name: string;
}

export default function QnASection({ onBack }: QnASectionProps) {
  const [questionText, setQuestionText] = useState("");
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [role, setRole] = useState<"organizer" | "attendee" | "">("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchUserRole = async () => {
    if (!userId) return;
    try {
      const res = await fetch("http://localhost:8000/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      setRole(data.user?.role || "");
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  const fetchEvents = async () => {
    if (!userId || !role) return;

    try {
      const res = await fetch(
        role === "organizer"
          ? "http://localhost:8000/events/organizer_event"
          : "http://localhost:8000/events/user_events",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [role === "organizer" ? "organizer_id" : "user_id"]: userId,
          }),
        }
      );
      const data = await res.json();
      setEvents(data?.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchQuestions = async (eventId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/questions/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        console.error("Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error loading questions:", err);
    }
  };

  const submitQuestion = async () => {
    if (!questionText.trim() || !selectedEventId || !userId) return;

    await fetch("http://localhost:8000/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: selectedEventId,
        user_id: userId,
        question: questionText,
      }),
    });

    setQuestionText("");
    fetchQuestions(selectedEventId);
  };

  const submitAnswer = async (questionId: string) => {
    const answer = answerTexts[questionId];
    if (!answer.trim()) return;

    await fetch(`http://localhost:8000/questions/${questionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        answer_text: answer,
      }),
    });

    setAnswerTexts((prev) => ({ ...prev, [questionId]: "" }));
    fetchQuestions(selectedEventId);
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (role) fetchEvents();
  }, [role]);

  useEffect(() => {
    if (selectedEventId) fetchQuestions(selectedEventId);
  }, [selectedEventId]);

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

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="mb-6 w-full p-3 border rounded-xl border-blue-500 text-gray-700"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        {role === "organizer" && selectedEventId && (
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
        )}

        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Questions
        </h3>

        <ul className="space-y-4">
          {questions.map((q) => (
            <li
              key={q._id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm text-gray-800"
            >
              <div className="font-medium mb-1">{q.question}</div>

              {/* Answers Display */}
              {(q.answers?.length ?? 0) > 0 && (
  <ul className="ml-4 text-sm text-gray-600 space-y-1 mt-2">
    {q.answers?.map((a, i) => (
      <li key={i}>{a.text}</li>
    ))}
  </ul>
)}


              {/* Answer Input (Attendee Only) */}
              {role === "attendee" && (
                <div className="mt-3 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={answerTexts[q._id] || ""}
                    onChange={(e) =>
                      setAnswerTexts((prev) => ({
                        ...prev,
                        [q._id]: e.target.value,
                      }))
                    }
                    className="flex-grow border p-2 rounded-md text-sm"
                  />
                  <button
                    onClick={() => submitAnswer(q._id)}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Send
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
