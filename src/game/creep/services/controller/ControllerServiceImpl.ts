import {ControllerService} from "./ControllerService";

export class ControllerServiceImpl implements ControllerService {
  public upgradeNearestController(creep: Creep) {
    if (!creep.room.controller) {
      creep.say('🟧 no controller in this room !');
      return false;
    }

    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#fff' } });
    }

    return true;
  }
}
