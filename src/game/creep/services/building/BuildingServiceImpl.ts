import {BuildingService} from "./BuildingService";

export class BuildingServiceImpl implements BuildingService {

  public buildNearestConstructionSite(creep: Creep) {
    const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

    if (!target) {
      return false;
    }

    if (creep.build(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }

    return true;
  }

}
