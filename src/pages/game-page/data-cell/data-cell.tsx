import React, { memo } from 'react';
import classes from './data-cell.module.css';
import { COLOR_SCHEME } from './color-scheme';
import { IPoint } from '../../../models/layout';

type DataCellProps = {
  value: number,
  point: IPoint,
  cornersOffset: string,
}

export const DataCell: React.FC<DataCellProps> = memo(({ value, point, cornersOffset }) => {
  return (
    <g className={classes.container} transform={`translate(${point.x}, ${point.y})`}>
      <polygon className={classes.polygon} points={cornersOffset} fill={COLOR_SCHEME[value] || COLOR_SCHEME[4096]} />
      <text className={classes.text} style={{ fill: value > 4 ? '#f9f6f2': '#776e65' }}>{value}</text>
    </g>
  );
});
