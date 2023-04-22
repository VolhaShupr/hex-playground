import React, { memo } from 'react';
import { Hex } from '../../../models/grid';
import { IPoint } from '../../../models/layout';

type LayoutCellProps = {
  data: Hex,
  value: number,
  point: IPoint,
  cornersOffset: string,
  borderWidth: number,
}

export const LayoutCell: React.FC<LayoutCellProps> = memo(({
  data: {x, y, z},
  value,
  point,
  cornersOffset,
  borderWidth
}) => {
  return (
    <g
      data-x={x} data-y={y} data-z={z} data-value={value}
      transform={`translate(${point.x}, ${point.y})`}
    >
      <polygon points={cornersOffset} style={{
        stroke: '#b5a89b',
        strokeWidth: borderWidth,
        fill: 'transparent'
      }} />
      {/*<text y={15}>{x},{y},{z}</text>*/}
    </g>
  );
});
