import {Process} from "../../Process";

export class ColonyProcess extends Process<'colony'> {

  protected preRun(): void {
    this.log("preRun() called");
  }

  protected run(): void {
    if (!this.room) {
      this.completed();
      return;
    }

    
  }

  protected postRun(): void {
  }

}
