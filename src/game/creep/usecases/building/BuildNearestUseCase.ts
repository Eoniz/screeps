import {BuildingService} from "../../services/building/BuildingService";

export class BuildNearestUseCase {

  constructor(
    private readonly _buildingService: BuildingService,
  ) {
  }

  public execute(creep: Creep) {
    return this._buildingService.buildNearestConstructionSite(creep);
  }

}
