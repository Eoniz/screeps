import {ResourcesService} from "../../services/resources/ResourcesService";

export class DropResourcesUseCase {

  constructor(
    private readonly _resourcesService: ResourcesService,
  ) {
  }

  public execute(creep: Creep) {
    this._resourcesService.dropResources(creep);
  }

}
