import {Handler} from "./Handler";
import {HarvestUseCase} from "../usecases/HarvestUseCase";
import {DropResourcesUseCase} from "../usecases/DropResourcesUseCase";

export class UpgraderHandler implements Handler {

  constructor(
    private readonly _harvestUseCase: HarvestUseCase,
    private readonly _dropResourcesUseCase: DropResourcesUseCase,
  ) {
  }

  public gameTick(creep: Creep) {
    if (creep.store.getFreeCapacity() > 0) {
      this._harvestUseCase.execute(creep);
      return;
    }

    this._dropResourcesUseCase.execute(creep);
  }

}
