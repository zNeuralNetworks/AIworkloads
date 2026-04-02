import React from 'react';

interface HorizontalBarComparisonChartProps {
  data: Array<{ name: string; fill: string; [key: string]: string | number }>;
  dataKey: string;
  valueUnit: string;
  xDomain?: [number, number];
}

const formatValue = (value: number, unit: string) => `${value}${unit}`;

const HorizontalBarComparisonChart: React.FC<HorizontalBarComparisonChartProps> = ({
  data,
  dataKey,
  valueUnit,
  xDomain,
}) => {
  const numericValues = data
    .map((entry) => entry[dataKey])
    .filter((value): value is number => typeof value === 'number');

  const domainMax = xDomain?.[1] ?? Math.max(...numericValues, 1);
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const value = Math.round((domainMax / (tickCount - 1)) * index);
    return value;
  });

  return (
    <div className="flex h-full flex-col justify-between gap-5">
      <div className="grid grid-cols-[120px_minmax(0,1fr)_72px] items-center gap-x-4 gap-y-4">
        {data.map((entry) => {
          const rawValue = entry[dataKey];
          const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
          const widthPercent = Math.max(0, Math.min(100, (value / domainMax) * 100));

          return (
            <React.Fragment key={`${entry.name}-${dataKey}`}>
              <div className="text-right text-xs font-medium text-slate-300">
                {entry.name}
              </div>
              <div className="relative h-7 overflow-hidden rounded-full border border-white/10 bg-[#0d1117]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${widthPercent}%`,
                    minWidth: value > 0 ? '0.75rem' : 0,
                    background: `linear-gradient(90deg, ${entry.fill}CC 0%, ${entry.fill} 100%)`,
                    boxShadow: `0 0 18px ${entry.fill}33`,
                  }}
                  title={formatValue(value, valueUnit)}
                />
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                {formatValue(value, valueUnit)}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="pl-[136px] pr-[72px]">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
          {ticks.map((tick) => (
            <span key={tick}>{formatValue(tick, valueUnit)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalBarComparisonChart;
