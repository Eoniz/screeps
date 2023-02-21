import {KernelException} from "./KernelException";
import {ProcessType} from "../ProcessType";

export class ProcessException extends KernelException {

  constructor(processType: ProcessType, msg?: string) {
    super(`[${processType}] ${ msg ? msg : 'An unexpected exception occured'}`);
  }

}
