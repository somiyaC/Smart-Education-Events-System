"use client";
import {Button
  , Modal,
  Box
} from "@mui/material"
import { useEffect, useState } from "react";
import PollCard from "./PollCard";
import { useAppContext } from "@/app/StateContext";

interface Options {
  text: string;
  stat: number;
  count: number;
}

interface Answer {
  user_id: string;
  answer: string;
}

interface Poll {
  id: string;
  question: string;
  options: [Options];
  created_by: string;
  status: boolean;
  answers: [Answer];
  total_count: number;
}

export default function LivePoll({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [status, setStatus] = useState("");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [local, setLocal] = useState<boolean>(false);
  const [createPollModalOpen, setCreatePollModalOpen] = useState(false);
  const userId = localStorage.getItem("user_id");

  const {isOrganizer} = useAppContext();

  const createPoll = async () => {
    const event_id = localStorage.getItem("event_id");
    const created_by = localStorage.getItem("user_id");

    const res = await fetch("http://localhost:8000/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        created_by,
        question,
        options: [{ text: option1 }, { text: option2 }],
        duration: 60,
        status: true,
        answers: [],
        total_count: 0
      }),
    });

    if (res.ok) {
      setStatus("✅ Poll created!");
    } else {
      setStatus("❌ Failed to create poll.");
    }
  };

  useEffect(() => {
    const fetchPolls = async () => {
      const res = await fetch("http://localhost:8000/polls");
      const resData = await res.json();
      setPolls(resData.polls);
    }
    fetchPolls();
  },[local])

  const handlePollAnswer = async (poll_id: string, option: string) => {
    const user_id = localStorage.getItem("user_id");
    const res = await fetch("http://localhost:8000/polls/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user_id,
        answer: option,
        poll_id: poll_id
      }),
    });
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 w-full">
      {isOrganizer && <Button sx={{color:"#ffffff"}} onClick={() => setCreatePollModalOpen(true)}  variant="contained">
          Create Poll
      </Button>}
      <div className="bg-white mt-8 border border-gray-300 rounded-2xl shadow-xl p-8 w-full max-w-xl">

        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 text-sm mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        
      <Modal
        open={createPollModalOpen}
        onClose={() => setCreatePollModalOpen(false)}
        aria-labelledby="add-material-title"
      >
        <Box 
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
        >

        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Create a Live Poll
        </h2>

        <input
          type="text"
          placeholder="Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Option 1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Option 2"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          className="w-full p-3 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          onClick={createPoll}
          className="w-full bg-gradient-to-r from-orange-400 to-yellow-300 text-white font-semibold py-3 rounded-xl shadow-md hover:scale-105 transform transition"
        >
          Create Poll
        </button>
        </Box>
      </Modal>
      {polls.map((poll) => {
        const userAnswer = poll.answers?.find(
          (answer: { user_id: string }) => answer.user_id === userId
        );

        const hasAnswered = !!userAnswer;

        return (
          <PollCard
            setLocal={setLocal}
            completed={hasAnswered}
            selectedAnswer={userAnswer?.answer || ''}
            onAnswer={handlePollAnswer}
            key={poll.id}
            poll={poll}
          />
        );
      })}

        {status && (
          <p className="mt-4 text-sm text-gray-700 font-medium">{status}</p>
        )}
      
      </div>
    </div>
  );
}
