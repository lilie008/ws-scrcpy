import { Mw } from '../../mw/Mw';
import { Multiplexer } from '../../../packages/multiplexer/Multiplexer';
import { ChannelCode } from '../../../common/ChannelCode';
import Util from '../../../app/Util';
import Protocol from '@devicefarmer/adbkit/lib/adb/protocol';
import { AdbUtils } from '../AdbUtils';

export class PrintLog extends Mw {
    public static readonly TAG = 'PrintLog';
    protected name = 'PrintLog';

    public static processChannel(ws: Multiplexer, code: string, data: ArrayBuffer): Mw | undefined {
        if (code !== ChannelCode.LOGS) {
            return;
        }
        if (!data || data.byteLength < 4) {
            return;
        }
        const buffer = Buffer.from(data);
        const length = buffer.readInt32LE(0);
        const serial = Util.utf8ByteArrayToString(buffer.slice(4, 4 + length));
        return new PrintLog(ws, serial);
    }

    constructor(ws: Multiplexer, private readonly serial: string) {
        super(ws);
        ws.on('channel', (params) => {
            PrintLog.handleNewChannel(this.serial, params.channel, params.data);
        });
    }

    protected sendMessage = (): void => {
        throw Error('Do not use this method. You must send data over channels');
    };

    protected onSocketMessage(): void {
        // Nothing here. All communication are performed over the channels. See `handleNewChannel` below.
    }

    private static handleNewChannel(serial: string, channel: Multiplexer, arrayBuffer: ArrayBuffer): void {
        const data = Buffer.from(arrayBuffer);
        if (data.length < 4) {
            console.error(`[${PrintLog.TAG}]`, `Invalid message. Too short (${data.length})`);
            return;
        }
        const cmd = Util.utf8ByteArrayToString(data.slice(0, 4));
        switch (cmd) {
            case Protocol.LOGS:
                PrintLog.handle(cmd, serial, channel).catch((e: Error) => {
                    console.error(`[${PrintLog.TAG}]`, e.message);
                });
                break;
            default:
                console.error(`[${PrintLog.TAG}]`, `Invalid message. Wrong command (${cmd})`);
                channel.close(4001, `Invalid message. Wrong command (${cmd})`);
                break;
        }
    }

    private static async handle(cmd: string, serial: string, channel: Multiplexer) {
        try {
            if (cmd === Protocol.LOGS) {
                return AdbUtils.pipeLogToStream(serial, channel);
            }
        } catch (e) {
            PrintLog.sendError(e.message, channel);
        }
    }

    private static sendError(message: string, channel: Multiplexer): void {
        if (channel.readyState === channel.OPEN) {
            const length = Buffer.byteLength(message, 'utf-8');
            const buf = Buffer.alloc(4 + 4 + length);
            let offset = buf.write(Protocol.FAIL, 'ascii');
            offset = buf.writeUInt32LE(length, offset);
            buf.write(message, offset, 'utf-8');
            channel.send(buf);
            channel.close();
        }
    }
}
