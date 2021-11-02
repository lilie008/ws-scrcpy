import { BaseClient } from '../../client/BaseClient';
import { ParamsPrintLog } from '../../../types/ParamsPrintLog';
import { ParsedUrlQuery } from 'querystring';
import { LogReceiver } from './LogReceiver';
import {ParamsStreamScrcpy} from "../../../types/ParamsStreamScrcpy";
import {StreamReceiverScrcpy} from "./StreamReceiverScrcpy";
import {BasePlayer} from "../../player/BasePlayer";
import VideoSettings from "../../VideoSettings";

type StartParams = {
    udid: string;
};

export class LogClient extends BaseClient<ParamsPrintLog, never> {
    public static ACTION = 'log';
    private readonly logReceiver: LogReceiver;

    protected constructor(params: ParsedUrlQuery | ParamsPrintLog, logReceiver?: LogReceiver) {
        super(params);
        if (logReceiver) {
            this.logReceiver = logReceiver;
        } else {
            this.logReceiver = new LogReceiver(this.params);
        }
    }

    public onDisconnected = (): void => {
        this.logReceiver.off('disconnected', this.onDisconnected);
    };

    public startLog({ udid }: StartParams): void {
        if (!udid) {
            throw Error(`Invalid udid value: "${udid}"`);
        }

        const logReceiver = this.logReceiver;
        logReceiver.on('disconnected', this.onDisconnected);
    }

    public static startlog (
        params: ParsedUrlQuery | ParamsPrintLog,
        logReceiver?: LogReceiver,
    ): LogClient {
        return new LogClient(params, logReceiver);
    }
}
