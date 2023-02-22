
export const KER_INIT_PROCESS = 'init';
export const KER_COL_PROCESS = 'colony';
export const KER_COL_SPAWN_QUEUE_PROCESS = 'colony-spawn-queue';
export const KER_COL_SOURCE_PROCESS = 'colony-source-process';

export type ProcessType =
  | typeof KER_INIT_PROCESS
  | typeof KER_COL_PROCESS
  | typeof KER_COL_SPAWN_QUEUE_PROCESS
  | typeof KER_COL_SOURCE_PROCESS
  ;

