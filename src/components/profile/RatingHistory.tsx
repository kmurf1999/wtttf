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
      getValue: (datum) => datum.date,
      formatters: {
        cursor: (date: Date) => new Date().toDateString(),
      },
      tickCount: 2,
    }),
    [],
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<RatingDatum>[] => [
      {
        getValue: (datum) => datum.rating,
        showDatumElements: true,
        tickCount: 2,
      },
    ],
    [],
  );

  if (!history.data) return null;

  const data: ChartOptions<RatingDatum>['data'] = [
    {
      label: 'Rating',
      data: history.data,
    },
  ];

  return (
    <div className="relative w-full h-96 border-t p-2 pl-0">
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
