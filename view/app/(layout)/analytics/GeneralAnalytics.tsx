import { Typography } from '@mui/material';
import { BarChart} from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

const chartSetting = {
    xAxis: [
      {
        label: 'sales ($)',
      },
    ],
    width: 500,
    height: 400,
};


export function valueFormatter(value: number | null) {
  return `${value} $`;
}
  
interface AnalyticsProp {
  sales_dict: [];
  participants_dict: [];
  total_participants: number;
  total_money: number;
  total_events: number;
  participants_chart: [];
  participants_chart_names: [];
}

export default function GeneralAnalytics ({participants_chart,participants_chart_names,sales_dict, participants_dict, total_money, total_events, total_participants}: AnalyticsProp) {
    return (
        <div className='flex flex-row justify-around items-center mb-4'>
            <div className='mr-4 flex flex-col items-center justify-center'>
                <BarChart
                series={participants_chart}
                height={290}
                width={500}
                colors={['orange', 'gray','amber']}
                xAxis={[{ data: participants_chart_names, scaleType: 'band' }]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                />
                <Typography variant="h6" align="center" mt={2}>
                    Attendance Report
                </Typography>
            </div>
            <div className='flex flex-col items-center justify-center'>

            <PieChart
            series={[
                {
                data:participants_dict,
                },
            ]}
            colors={['orange', 'gray','amber']}
            width={400}
            height={200}
            />
            <Typography variant="h6" align="center" mt={2}>
              Total Attendance Report
            </Typography>
            </div>
            <div>
            <BarChart
            dataset={sales_dict}
            yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
            series={[{ dataKey: 'sales', label: 'Event Sales', valueFormatter }]}
            layout="horizontal"
            colors={['orange']}
            {...chartSetting}
            />
            </div>
        
        </div>
    )
}