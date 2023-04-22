import { groupBy, sortBy } from './utils';
import { IActionSettings } from '../settings/game-settings';

export enum AxisType { x = 'x', y = 'y', z = 'z' }
export type Axis = keyof typeof AxisType
type HexCoordinates = {
  [P in AxisType]: number
}

export class Hex {

  constructor(public x: number, public y: number, public z: number) { }

  /**
   * Shifts hexagon to the most top available position of main axis row
   * @param {number} radius Grid radius
   * @param {Axis} mainAxis Main axis (which coordinate is the same for all hexagons in axis row)
   * @param {Axis} moveDirection Axis in which direction to shift
   * @param {number} occupied Number of filled cells to skip
   * @returns {Hex} New hexagon
   */
  shiftTop(radius: number, mainAxis: Axis, moveDirection: Axis, occupied: number): Hex {
    const topCoordinate = (this[mainAxis] <= 0 ? radius : radius - this[mainAxis]) - occupied;
    return Hex.getNewByCoordinates({
      [mainAxis]: this[mainAxis],
      [moveDirection]: topCoordinate,
    });
  }

  /**
   * Returns new hexagon based on provided two coordinates and calculated the third one
   * @param {HexCoordinates} coordinates Object that contains at least two coordinates from x, y, z
   * @returns {Hex} New hexagon
   */
  static getNewByCoordinates({x, y, z}: Partial<HexCoordinates>): Hex {
    const hexX = x ?? -y! - z!;
    const hexY = y ?? -x! - z!;
    const hexZ = z ?? -x! - y!;
    return new Hex(hexX, hexY, hexZ);
  }
}

export class DataHex extends Hex {

  constructor(x: number, y: number, z: number, public value: number, public index: number) {
    super(x, y, z);
  }

  shiftTop(radius: number, mainAxis: Axis, moveDirection: Axis, occupied: number): DataHex {
    const hex = super.shiftTop(radius, mainAxis, moveDirection, occupied);
    return new DataHex(hex.x, hex.y, hex.z, this.value, this.index);
  }

  updateValue(newValue: number): DataHex {
    return new DataHex(this.x, this.y, this.z, newValue, this.index);
  }

}

export interface HexDictionary<T extends Hex> {
  [id: string]: T
}

function getHexId({ x, y, z}: Hex): string {
  return `${x}${y}${z}`;
}

export class Grid {

  constructor(public radius: number) {}

  convertToDictionary<T extends Hex>(hexes: T[]): HexDictionary<T> {
    return hexes.reduce((acc: HexDictionary<T>, item: T) => ({
      ...acc,
      [getHexId(item)]: item
    }), {}); // todo: use Map?
  }

  /**
   * @returns {number} Max number of hexes in axis row
   */
  getAxisMaxHexes(): number {
    return 1 + 2 * this.radius;
  }

  /**
   * Merges and moves data hexagons in direction based on user action
   * @param {DataHex[]} hexes Data hexagons
   * @param {IActionSettings} settings Action settings
   * @returns {DataHex[]} Updated data hexagons
   */
  move(hexes: DataHex[], { mainAxis, moveDirection }: IActionSettings): DataHex[] {
    return groupBy(hexes, mainAxis)
      .map((group: DataHex[]) => {
        const sorted = sortBy(group, moveDirection, true);
        const merged = this.mergeLeft(sorted);
        return merged.map((item: DataHex, i: number) => item.shiftTop(this.radius, mainAxis, moveDirection, i));
      })
      .flat();
  }

  /**
   * Generates hexagon grid
   * @returns {Hex[]} List of hexagons
   */
  getLayoutHexes(): Hex[] {
    const radius = this.radius;
    let cells: Hex[] = [];
    for (let x = -radius; x <= radius; x++) {
      let y1 = Math.max(-radius, -x - radius);
      let y2 = Math.min(radius, -x + radius);
      for (let y = y1; y <= y2; y++) {
        cells.push(new Hex(x, y, -x - y));
      }
    }
    return cells;
  }

  /**
   * Merges hexagons in the provided row
   * @param {DataHex[]} hexes Row of data hexagons
   * @returns {DataHex[]} List of merged data hexagons
   */
  private mergeLeft([...arr]: DataHex[]): DataHex[] {
    const result = [];
    while (arr.length) {
      let firstItem = arr.shift()!;
      if (firstItem.value === arr[0]?.value) {
        const secondItem = arr.shift()!;
        const mergedValue = firstItem.value + secondItem.value;
        const itemToUpdate = (firstItem.index < secondItem.index) ? firstItem : secondItem;
        firstItem = itemToUpdate.updateValue(mergedValue);
      }
      result.push(firstItem);
    }
    return result;
  }
}
