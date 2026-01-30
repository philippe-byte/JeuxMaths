import { GridData } from './types';
import { buildBalancedGrid } from './data';
import { simpleSeeds, advancedSeeds, expertSeeds } from './seeds';

export const getGrids = (): GridData[] => {
    const grids: GridData[] = [];

    simpleSeeds.forEach((s, i) => {
        grids.push(buildBalancedGrid(`simple-${i}`, 'simple', 6, 7, s.m, s.oh, s.ov));
    });

    advancedSeeds.forEach((s, i) => {
        grids.push(buildBalancedGrid(`advanced-${i}`, 'advanced', 8, 11, s.m, s.oh, s.ov));
    });

    expertSeeds.forEach((s, i) => {
        grids.push(buildBalancedGrid(`expert-${i}`, 'expert', 10, 11, s.m, s.oh, s.ov));
    });

    return grids;
};
