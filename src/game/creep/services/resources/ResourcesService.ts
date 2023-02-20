
export interface ResourcesService {
  harvestNearestSource(creep: Creep): void;
  harvestSourceByCreepId(creep: Creep): void;
  dropResources(creep: Creep): void;
}
