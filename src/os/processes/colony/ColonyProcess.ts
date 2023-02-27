import {Process} from "../../Process";
import {KER_COL_CONTROLLER_PROCESS, KER_COL_SOURCE_PROCESS, KER_COL_SPAWN_QUEUE_PROCESS} from "../../ProcessType";
import {Colony} from "../../../screeps/Colony";

export class ColonyProcess extends Process<'colony'> {

  private _colony!: Colony;

  protected preRun(): void {
  }

  protected run(): void {
    if (!this.room) {
      this.log("No room --> aborting");

      this.completed();
      return;
    }

    if (!this.metaData.roomName) {
      this.log("No room name --> aborting");
      this.completed();
      return;
    }

    const colony = this.kernel.memory.empire.getColony(this.metaData.roomName);

    if (!colony) {
      this.log(`No colony in kernel empire with name ${this.metaData.roomName} --> aborting`);

      this.completed();
      return;
    }

    this._colony = colony;

    this.kernel.addProcessIfNotPresent(
      KER_COL_SPAWN_QUEUE_PROCESS,
      `colony-spawn-queue-${colony.coreRoom.name}`,
      this.priority - 5,
      {
        colonyProcessName: this.name,
      },
    );

    this._colony.sources.forEach((_source) => {
      this.kernel.addProcessIfNotPresent(
        KER_COL_SOURCE_PROCESS,
        `colony-source-${_source.id}`,
        this.priority - 10,
        {
          roomName: _source.room.name,
          colonyProcessName: this.name,
          sourceId: _source.id,
          nextCreepName: null,
          creeps: [],
        }
      );
    });

    const rooms: Array<Room> = Object.values(
      this.colony.sources.reduce((prev, curr) => {
        return {
          ...prev,
          [curr.room.name]: curr.room
        }
      }, {})
    );

    rooms.forEach((_room) => {
      if (!_room.controller || !_room.controller.my) {
        return;
      }

      this.kernel.addProcessIfNotPresent(
        KER_COL_CONTROLLER_PROCESS,
        `colony-controller-${_room.controller.id}`,
        this.priority - 10,
        {
          roomName: _room.name,
          colonyProcessName: this.name,
          controller: _room.controller.id,
          creeps: [],
          nextCreepName: null,
        }
      )
    });
  }

  protected postRun(): void {
  }

  public get colony() {
    return this._colony;
  }
}
