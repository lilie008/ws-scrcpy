import { BaseClient } from '../../client/BaseClient';
import { ParamsPrintLog } from '../../../types/ParamsPrintLog';
import { ParsedUrlQuery } from 'querystring';
import { LogReceiver } from './LogReceiver';

const TAG = '[LogClient]';

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
        const { udid } = this.params;
        this.startPrintLog({ udid });
    }

    public onLog = (data: ArrayBuffer): void => {
        const logMsg = Buffer.from(data);
        console.log(TAG, logMsg);
    };

    public onDisconnected = (): void => {
        this.logReceiver.off('disconnected', this.onDisconnected);
    };

    public startPrintLog({ udid }: StartParams): void {
        if (!udid) {
            throw Error(`Invalid udid value: "${udid}"`);
        }

        const logReceiver = this.logReceiver;
        logReceiver.on('log', this.onLog);
        logReceiver.on('disconnected', this.onDisconnected);
    }

    public static start(params: ParsedUrlQuery | ParamsPrintLog, logReceiver?: LogReceiver): LogClient {
        return new LogClient(params, logReceiver);
    }
}
