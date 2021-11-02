import { ManagerClient } from './ManagerClient';
import { ParamsPrintLog } from '../../types/ParamsPrintLog';
import { ACTION } from '../../common/Action';
import Util from '../Util';
import { ControlMessage } from '../controlMessage/ControlMessage';

const MAGIC_BYTES_INITIAL = Util.stringToUtf8ByteArray('scrcpy_log');

interface PrintLogReceiverEvents {
    log: ArrayBuffer;
    connected: void;
    disconnected: CloseEvent;
}

const TAG = '[PrintLogReceiver]';

export class PrintLogReceiver<P extends ParamsPrintLog> extends ManagerClient<ParamsPrintLog, PrintLogReceiverEvents> {
    private events: ControlMessage[] = [];

    public static readonly ACTION = ACTION.SHOW_LOG;

    constructor(params: P) {
        super(params);
        this.openNewConnection();
        if (this.ws) {
            this.ws.binaryType = 'arraybuffer';
        }
    }

    protected onSocketClose(ev: CloseEvent): void {
        console.log(`${TAG}. WS closed: ${ev.reason}`);
        this.emit('disconnected', ev);
    }

    protected onSocketMessage(e: MessageEvent): void {
        if (e.data instanceof ArrayBuffer) {
            // works only because MAGIC_BYTES_INITIAL and MAGIC_BYTES_MESSAGE have same length
            if (e.data.byteLength > MAGIC_BYTES_INITIAL.length) {
                const magicBytes = new Uint8Array(e.data, 0, MAGIC_BYTES_INITIAL.length);
                if (PrintLogReceiver.EqualArrays(magicBytes, MAGIC_BYTES_INITIAL)) {
                    this.initLog();
                    return;
                }
            }

            this.emit('log', new Uint8Array(e.data));
        }
    }

    private initLog() {
        //todo
    }

    private static EqualArrays(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    protected onSocketOpen(): void {
        this.emit('connected', void 0);
        let e = this.events.shift();
        while (e) {
            this.sendEvent(e);
            e = this.events.shift();
        }
    }

    public sendEvent(event: ControlMessage): void {
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.send(event.toBuffer());
        } else {
            this.events.push(event);
        }
    }

    public stop(): void {
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
        }
        this.events.length = 0;
    }
}
