import { useMemo } from 'react';
import { AxisOptions, Chart, ChartOptions } from 'react-charts';
import { trpc } from '../../utils/trpc';

type RatingDatum = {
  date: Date;
  rating: number;
};

const RatingHistory = ({ userId }: { userId: string }) => {
  const history = trpc.useQuery(['user.ratingHistory', { userId }]);

  const primaryAxis = useMemo(
    (): AxisOptions<RatingDatum> => ({
      getValue: (datum: RatingDatum) => datum.date,
      formatters: {
        cursor: (date: Date) => (date ? date.toDateString() : ''),
      },
      tickCount: 2,
    }),
    [],
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<RatingDatum>[] => [
      {
        getValue: (datum: RatingDatum) => datum.rating,
        showDatumElements: true,
        tickCount: 2,
      },
    ],
    [],
  );

  if (!history.data || history.data.length === 0)
    return <div className="relative w-full h-96 " />;

  const data: ChartOptions<RatingDatum>['data'] = [
    {
      label: 'Rating',
      data: history.data,
    },
  ];

  return (
    <div className="relative w-full h-96  ">
      <div className="relative w-full h-full">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
    </div>
  );
};

export default RatingHistory;
