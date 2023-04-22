import { Axis, AxisType } from '../models/grid';

export const GAME_SETTINGS = {
  minRadius: 2,
  maxRadius: 6,
  fieldWidth: 540,
  fieldHeight: 550,
};

export enum ActionType {
  N = 'KeyW',
  NE = 'KeyE',
  NW = 'KeyQ',
  S = 'KeyS',
  SE = 'KeyD',
  SW = 'KeyA',
}

export interface IActionSettings {
  mainAxis: Axis,
  moveDirection: Axis,
}
export type ActionSettings = {
  [P in ActionType]: IActionSettings
}
export const ACTION_SETTINGS: ActionSettings = {
  [ActionType.N]: { mainAxis: AxisType.x, moveDirection: AxisType.y },
  [ActionType.NE]: { mainAxis: AxisType.y, moveDirection: AxisType.x },
  [ActionType.NW]: { mainAxis: AxisType.z, moveDirection: AxisType.y },
  [ActionType.S]: { mainAxis: AxisType.x, moveDirection: AxisType.z },
  [ActionType.SE]: { mainAxis: AxisType.z, moveDirection: AxisType.x },
  [ActionType.SW]: { mainAxis: AxisType.y, moveDirection: AxisType.z },
};

export enum GameStatusType {
  Error = 'network-issues',
  Playing = 'playing',
  Gameover = 'game-over'
}
