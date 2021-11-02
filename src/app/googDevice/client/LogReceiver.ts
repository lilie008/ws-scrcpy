import { ParsedUrlQuery } from 'querystring';
import { ACTION } from '../../../common/Action';
import Util from '../../Util';
import { PrintLogReceiver } from '../../client/PrintLogReceiver';
import { ParamsPrintLog } from '../../../types/ParamsPrintLog';

export class LogReceiver extends PrintLogReceiver<ParamsPrintLog> {
    public parseParameters(params: ParsedUrlQuery): ParamsPrintLog {
        const typedParams = super.parseParameters(params);
        const { action } = typedParams;
        if (action !== ACTION.SHOW_LOG) {
            throw Error('Incorrect action');
        }
        return {
            ...typedParams,
            action,
            udid: Util.parseStringEnv(params.udid),
            ws: Util.parseStringEnv(params.ws),
        };
    }

    protected buildDirectWebSocketUrl(): URL {
        // const localUrl = super.buildDirectWebSocketUrl();
        // localUrl.searchParams.set('action', ACTION.SHOW_LOG);
        // return localUrl;
        // 不太确定是哪个url
        return new URL((this.params as ParamsPrintLog).ws);
    }
}
