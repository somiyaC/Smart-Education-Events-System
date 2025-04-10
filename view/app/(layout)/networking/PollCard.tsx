import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';

interface Option {
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
  options: Option[];
  created_by: string;
  status: boolean;
  answers: [Answer];
  total_count: number;
}

interface PollCardProps {
  poll: Poll;
  onAnswer: (pollId: string, answer: string) => void;
  completed: boolean;
  selectedAnswer: string;
  setLocal: React.Dispatch<React.SetStateAction<boolean>>;
}

const PollCard: React.FC<PollCardProps> = ({ setLocal,poll, onAnswer, completed, selectedAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(selectedAnswer);
  const [isAnswered, setIsAnswered] = useState(completed);
  const [loc, setLoc] = useState(false);

  const handleSubmit = () => {
    if (selectedOption) {
      setLoc(true);
      setLocal(true);
      setIsAnswered(true);
      onAnswer(poll.id, selectedOption);
    }
  };

  useEffect(() => {
    
  },[loc])

  return (
    <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
      <Typography variant="h6" gutterBottom>
        {poll.question}
      </Typography>

      <RadioGroup
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        {!isAnswered && poll.options.map((option, idx) => (
          <FormControlLabel
            key={idx}
            value={option.text}
            control={<Radio disabled={isAnswered} />}
            label={option.text}
          />
        ))}
        {loc && poll.options.map((option, idx) => {
            if (option.text === selectedOption) {
                return (<FormControlLabel
                key={idx}
                value={option.text}
                control={<Radio disabled={isAnswered} />}
                label={option.text+" "+(((option.count+1)/(poll.total_count+1)*100))+"%"}
            />)
            } else {
                return (<FormControlLabel
                    key={idx}
                    value={option.text}
                    control={<Radio disabled={isAnswered} />}
                    label={option.text+" "+(((option.count)/(poll.total_count+1)*100))+"%"}
                    />)
            }
        })}
        {isAnswered && !loc && poll.options.map((option, idx) => (
            <FormControlLabel
            key={idx}
            value={option.text}
            control={<Radio disabled={isAnswered} />}
            label={option.text+" "+option.stat+"%"}
          />
        ))}
      </RadioGroup>

      {!isAnswered && (
        <Button
          variant="contained"
          sx={{color:"#ffffff"}}
          disabled={!selectedOption}
          onClick={handleSubmit}
          style={{ marginTop: 12 }}
        >
          Submit
        </Button>
      )}

      {isAnswered && (
        <Typography variant="body2" style={{ marginTop: 12, color: 'green' }}>
          You have answered this poll.
        </Typography>
      )}
    </Paper>
  );
};

export default PollCard;
