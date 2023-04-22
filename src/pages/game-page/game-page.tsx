import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classes from './game-page.module.css';
import { DataCell } from './data-cell/data-cell';
import { DataHex, Grid, Hex, HexDictionary } from '../../models/grid';
import { Layout, PointDictionary } from '../../models/layout';
import { GameService } from '../../services/game-service';
import { catchError, EMPTY, filter, fromEvent, map, takeWhile, tap, throttle } from 'rxjs';
import { LayoutCell } from './layout-cell/layout-cell';
import { areObjectsKeysEqual, getUrlSearchParams, sortBy } from '../../models/utils';
import { ACTION_SETTINGS, ActionType, GAME_SETTINGS, GameStatusType, IActionSettings } from '../../settings/game-settings';

const { minRadius, maxRadius, fieldWidth, fieldHeight } = GAME_SETTINGS;

// scales border width depending on hex quantity
function getCellBorderWidth(radius = 2, minWidth = 2, maxWidth = 9): number {
  return Math.floor(maxWidth + (minWidth - maxWidth) / (maxRadius - minRadius) * (radius - minRadius));
}

export const GamePage: React.FC = () => {
  const { service, grid, field, totalTiles, hexCenterCoords, hexCornerOffsets, cellBorderWidth } = useMemo(() => {
    const { hostname, port, radius: r } = getUrlSearchParams();
    const radius = Number(r);
    const service = new GameService(hostname, port, radius);
    service.fetchNewItems();

    // generates static layer grid
    const grid = new Grid(radius - 1);
    const hexes: Hex[] = grid.getLayoutHexes();
    const field: HexDictionary<Hex> = grid.convertToDictionary(hexes);
    const totalTiles = hexes.length;

    // calculates data related to displaying hexagons
    const yTilesCount = grid.getAxisMaxHexes();
    const tileSize = Math.floor(fieldWidth / (yTilesCount * Math.sqrt(3)));
    const painLayout = new Layout(tileSize);
    const hexCenterCoords: PointDictionary = painLayout.getPointDictionary(field);
    const hexCornerOffsets = painLayout.getHexCornerOffsets().map((point) => `${point.x},${point.y}`).join(' ');
    const cellBorderWidth = getCellBorderWidth(radius);

    return { service, grid, field, totalTiles, hexCenterCoords, hexCornerOffsets, cellBorderWidth };
  }, []);

  const [currentData, setCurrentData] = useState<HexDictionary<DataHex>>({});
  const [gameStatus, setGameStatus] = useState<GameStatusType>(GameStatusType.Playing);

  // adds new hexes from the server
  // if there is no more free space on the field, checks possible moves
  // if there are no possible moves, the game ends
  const handleNewData = useCallback((prevData: HexDictionary<DataHex>, newData: HexDictionary<DataHex>) => {
    const currentData: HexDictionary<DataHex> = { ...prevData, ...newData };
    const isFieldFilled = Object.keys(currentData).length === totalTiles;
    if (isFieldFilled) {
      const hasMovements = Object.values(ACTION_SETTINGS).some((actionSettings: IActionSettings) => {
        const possibleMove = grid.move(Object.values(currentData), actionSettings);
        const possibleMoveData = grid.convertToDictionary(possibleMove);
        return !areObjectsKeysEqual(currentData, possibleMoveData);
      });
      if (!hasMovements) {
        setGameStatus(GameStatusType.Gameover);
      }
    }
    return currentData;
  }, []);

  const handleUserAction = useCallback((prevData: HexDictionary<DataHex>, actionSettings: IActionSettings) => {
    const newItems = grid.move(Object.values(prevData), actionSettings);
    const sortedByIndex = sortBy(newItems, 'index', false);
    const newData = grid.convertToDictionary(sortedByIndex);
    const isEqual = areObjectsKeysEqual(prevData, newData);
    if (isEqual) { // if nothing has changed after the user action, then don't request new data
      return prevData;
    }
    service.fetchNewItems(newItems);
    return newData;
  }, []);

  // subscribes on new data
  useEffect(() => {
    const subscription = service.data$.pipe(
      map((newItems: DataHex[]): HexDictionary<DataHex> => grid.convertToDictionary(newItems)),
      tap((newData: HexDictionary<DataHex>) =>
        setCurrentData((prevData: HexDictionary<DataHex>) => handleNewData(prevData, newData))
      ),
      catchError(() => {
        setGameStatus(GameStatusType.Error);
        return EMPTY;
      }),
    ).subscribe();

    return () => subscription.unsubscribe();
  }, []);

  // subscribes on key press event
  useEffect(() => {
    const subscription = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      takeWhile(() => gameStatus === GameStatusType.Playing),
      throttle(() => fromEvent<KeyboardEvent>(document, 'keyup')),
      filter(({ code }) => Object.values<string>(ActionType).includes(code)),
      map(({ code }) => ACTION_SETTINGS[code as ActionType]),
      tap((settings: IActionSettings) =>
        setCurrentData((prevData: HexDictionary<DataHex>) => handleUserAction(prevData, settings))
      ),
    ).subscribe();

    return () => subscription.unsubscribe();
  }, [gameStatus]);

  return (
    <>
      <div className={classes.field}>
        <svg
          width={fieldWidth}
          height={fieldHeight}
          viewBox={`${-fieldHeight/2} ${-fieldHeight/2} ${fieldHeight} ${fieldHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            { Object.entries(currentData).map(([id, hex]) => (
              <DataCell
                key={hex.index}
                value={hex.value}
                point={hexCenterCoords[id]}
                cornersOffset={hexCornerOffsets}
              />
            )) }

            { Object.entries(field).map(([id, hex], i) => (
              <LayoutCell
                key={i}
                data={hex}
                value={currentData[id]?.value || 0}
                point={hexCenterCoords[id]}
                cornersOffset={hexCornerOffsets}
                borderWidth={cellBorderWidth}
              />
            )) }
          </g>

        </svg>

      </div>
      <div className={classes.info}>
        <p data-status={gameStatus}>Game status: {gameStatus}</p>
        <p> Controls: q, w, e, a, s, d</p>
      </div>

    </>
  );
};
