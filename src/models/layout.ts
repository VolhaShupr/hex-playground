import { Hex, HexDictionary } from './grid';

// flat top layout
interface IOrientation { f0: number, f1: number, f2: number, f3: number, startAngle: number }
const FLAT_ORIENTATION: IOrientation = { f0: 3 / 2, f1: 0, f2: Math.sqrt(3) / 2, f3: Math.sqrt(3), startAngle: 0 };

export interface IPoint { x: number, y: number }
export interface PointDictionary {
  [id: string]: IPoint
}

export class Layout {
  private readonly orientation: IOrientation = FLAT_ORIENTATION;

  constructor(private size: number) {}

  getPointDictionary(hexLayout: HexDictionary<Hex>): PointDictionary {
    return Object.entries(hexLayout).reduce((acc, [id, item]) => ({
      ...acc,
      [id]: this.getHexCenterPixels(item)
    }), {});
  }

  /**
   * Converts given hexagon coordinates to pixel coordinates of hexagon center
   * @param {Hex} hex Hexagon g coordinates
   * @returns {IPoint} Center point of hexagon
   */
  private getHexCenterPixels(hex: Hex): IPoint {
    const M = this.orientation;
    const x = (M.f0 * hex.x + M.f1 * hex.z) * this.size;
    const y = (M.f2 * hex.x + M.f3 * hex.z) * this.size;
    return { x, y };
  }

  /**
   * Calculates hexagon corners coordinates
   * @returns {IPoint[]} List of 6 points
   */
  getHexCornerOffsets(): IPoint[] {
    const corners: IPoint[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = 2 * Math.PI * (this.orientation.startAngle - i) / 6.0;
      const offsetX = this.size * Math.cos(angle);
      const offsetY = this.size * Math.sin(angle);
      corners.push({ x: offsetX, y: offsetY });
    }
    return corners;
  }

}
