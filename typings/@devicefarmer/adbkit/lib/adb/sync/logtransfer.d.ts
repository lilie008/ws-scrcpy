/// <reference types="node" />
import { Stream } from 'stream';
declare class LogTransfer extends Stream.PassThrough {
    stats: {
        bytesTransferred: number;
    };
    cancel(): boolean;
    write(chunk: Buffer, encoding?: string | typeof callback, callback?: (error: Error | null | undefined) => void): boolean;
}
export = LogTransfer;