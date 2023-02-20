import {Controller} from "./Controller";
import {UpgradeRoomControllerUseCase} from "../usecases/controller/UpgradeRoomControllerUseCase";
import {HarvestSourceByCreepIdUseCase} from "../usecases/resources/HarvestSourceByCreepIdUseCase";
import {DropResourcesUseCase} from "../usecases/resources/DropResourcesUseCase";

export class UpgraderController implements Controller {

  constructor(
    private readonly _harvestUseCase: HarvestSourceByCreepIdUseCase,
    private readonly _upgradeRoomControllerUseCase: UpgradeRoomControllerUseCase,
    private readonly _dropResourcesUseCase: DropResourcesUseCase,
  ) {
  }

  public gameTick(creep: Creep) {
    if (creep.memory.upgrading && creep.store.energy === 0) {
      creep.memory.upgrading = false;
    }

    if (!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.upgrading = true;
    }

    if (creep.memory.upgrading) {
      if(!this._upgradeRoomControllerUseCase.execute(creep)) {
        this._dropResourcesUseCase.execute(creep);
      }
    } else {
      this._harvestUseCase.execute(creep);
    }
  }

}
