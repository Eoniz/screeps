import {Process} from "../../Process";
import {KER_COL_PROCESS} from "../../ProcessType";
import {RoomUtils} from "../../../utils/RoomUtils";

export class InitProcess extends Process<'init'> {

  protected preRun(): void {
    this.log("preRun() called");
  }

  protected run(): void {
    console.log(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }

    Object.values(Game.rooms).forEach((room) => {
      if (!RoomUtils.isMyRoom(room)) {
        return;
      }

      this.kernel.addProcessIfNotPresent(
        KER_COL_PROCESS,
        `colony-process-${room.name}`,
        90,
        {
          roomName: room.name,
        },
        this.name
      );
    });

    this.kernel.loadMemory();
  }

  protected postRun(): void {
    this.log("postRun() called");

    this.completed();
  }
}
