import {ControllerService} from "../../services/controller/ControllerService";

export class UpgradeRoomControllerUseCase {

  constructor(
    private readonly _controllerService: ControllerService,
  ) {
  }

  public execute(creep: Creep) {
    return this._controllerService.upgradeNearestController(creep);
  }

}
