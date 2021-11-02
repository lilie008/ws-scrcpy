import { ACTION } from '../common/Action';
import { ParamsBase } from './ParamsBase';

export interface ParamsPrintLog extends ParamsBase {
    action: ACTION.SHOW_LOG;
    udid: string;
    ws: string;
}
