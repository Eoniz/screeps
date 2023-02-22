import {Process} from "../../Process";
import {ColonyProcess} from "./ColonyProcess";
import {KER_COL_PROCESS} from "../../ProcessType";
import {Colony} from "../../../screeps/Colony";

export class ColonySourceProcess extends Process<'colony-source-process'> {

  protected preRun(): void {
  }

  protected run(): void {
    let colonyProcess!: ColonyProcess;
    try {
      colonyProcess = <ColonyProcess> this.kernel.getProcess(KER_COL_PROCESS, this.metaData.colonyProcessName);
    } catch (ignored) {
      this.completed();
      return;
    }

    if (colonyProcess.isCompleted) {
      this.completed();
      return;
    }

    const colony = colonyProcess.colony;

    if (!colony) {
      this.completed();
      return;
    }

    const source = colony.source(this.metaData.sourceId);

    if (!source) {
      this.completed();
      return;
    }

    this.checkContainer(colony, source);
  }

  protected postRun(): void {
  }

  private checkContainer(colony: Colony, source: Source) {
    if (!source) {
      return;
    }

    const container = colony.sourceContainer(source.id);
    if (container) {
      return;
    }

    const area = source.room.lookForAtArea(
      LOOK_TERRAIN,
      source.pos.y - 1,
      source.pos.x - 1,
      source.pos.y + 1,
      source.pos.x + 1,
    );

    const positions: Array<RoomPosition> = [];

    for (let y = source.pos.y - 1; y < source.pos.y + 1; y++) {
      for (let x = source.pos.x - 1; x < source.pos.x + 1; x++) {
        if (
          area[y][x].length
          && ['plain', 'swamp'].includes(area[y][x][0].toString())
        ) {
          positions.push(new RoomPosition(x, y, source.room.name));
          break;
        }
      }
    }

    if (!positions.length) {
      this.log("No positions");
      return;
    }

    const position = positions[0];

    position.createConstructionSite(STRUCTURE_CONTAINER);
  }

}
