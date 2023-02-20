import {HarvesterHandler} from "./handlers/HarvesterHandler";
import {HarvestUseCase} from "./usecases/HarvestUseCase";
import {DropResourcesUseCase} from "./usecases/DropResourcesUseCase";
import {ResourcesServiceImpl} from "./services/ResourcesServiceImpl";
import {BuilderHandler} from "./handlers/BuilderHandler";
import {UpgraderHandler} from "./handlers/UpgraderHandler";

export function provideHarvesterHandler() {
  const resourcesService = new ResourcesServiceImpl();

  const harvestUseCase = new HarvestUseCase(resourcesService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new HarvesterHandler(
    harvestUseCase,
    dropResourcesUseCase,
  );
}

export function provideUpgraderHandler() {
  const resourcesService = new ResourcesServiceImpl();

  const harvestUseCase = new HarvestUseCase(resourcesService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new BuilderHandler(
    harvestUseCase,
    dropResourcesUseCase,
  );
}

export function provideBuilderHandler() {
  const resourcesService = new ResourcesServiceImpl();

  const harvestUseCase = new HarvestUseCase(resourcesService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new UpgraderHandler(
    harvestUseCase,
    dropResourcesUseCase,
  );
}
