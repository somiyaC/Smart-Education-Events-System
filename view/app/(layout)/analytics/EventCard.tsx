import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { redirect } from 'next/navigation';

interface EventCardProps {
    event_name: string,
    event_description: string
    event_id: string
}

export default function EventCard({event_name, event_description, event_id}: EventCardProps) {

  const handleAnalytics = () => {
    redirect("/analytics/"+event_id)
  }
  
    return (
        <Card className='w-2/6 bg-blue-500' >
      <CardMedia
        sx={{ height: 140 }}
        image="/images/signup.jpg"
        title="green iguana"
        
      />
      <CardContent className='w-full'>
        <Typography gutterBottom variant="h5" component="div">
            {event_name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {event_description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleAnalytics}>View Analytics</Button>
      </CardActions>
    </Card>
    )
}