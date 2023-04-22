import React from 'react';
import classes from './app.module.css';
import { GamePage } from '../../pages/game-page/game-page';
import { getUrlSearchParams, isInRange } from '../../models/utils';
import { GAME_SETTINGS } from '../../settings/game-settings';

const { minRadius, maxRadius } = GAME_SETTINGS;

export const App: React.FC = () => {
  const { hostname, radius } = getUrlSearchParams();

  if (!hostname || !isInRange(Number(radius), minRadius, maxRadius)) {
    const newParams = new URLSearchParams({
      hostname: 'hex2048-lambda.octa.wtf',
      port: '80',
      radius: '3',
    }).toString();
    window.location.replace(`${window.location.origin}/?${newParams}`);
  }
  return (
    <div className={classes.container}>
      <GamePage/>
    </div>

  );
};
