
export const KER_INIT_PROCESS = 'init';
export const KER_COL_PROCESS = 'colony';
export const KER_COL_SPAWN_QUEUE_PROCESS = 'colony-spawn-queue';
export const KER_COL_SOURCE_PROCESS = 'colony-source-process';
export const KER_CREEP_HARVESTER_LIFETIME_PROCESS = 'creep-harvester-lifetime-process';
export const KER_CREEP_ACTION_HARVEST = 'creep-action-harvest';
export const KER_CREEP_ACTION_BUILD = 'creep-action-build';
export const KER_CREEP_ACTION_DROP_RESOURCES = 'creep-drop-resources';

export type ProcessType =
  | typeof KER_INIT_PROCESS
  | typeof KER_COL_PROCESS
  | typeof KER_COL_SPAWN_QUEUE_PROCESS
  | typeof KER_COL_SOURCE_PROCESS
  | typeof KER_CREEP_HARVESTER_LIFETIME_PROCESS
  | typeof KER_CREEP_ACTION_HARVEST
  | typeof KER_CREEP_ACTION_BUILD
  | typeof KER_CREEP_ACTION_DROP_RESOURCES
  ;

