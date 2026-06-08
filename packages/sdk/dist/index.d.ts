type DebugPilotConfig = {
    apiKey: string;
    endpoint?: string;
    service?: string;
    environment?: string;
};
type CaptureErrorOptions = {
    route?: string;
    metadata?: Record<string, unknown>;
};
export declare class DebugPilot {
    private apiKey;
    private endpoint;
    private service?;
    private environment?;
    constructor(config: DebugPilotConfig);
    captureError(error: Error, options?: CaptureErrorOptions): Promise<void>;
}
export {};
