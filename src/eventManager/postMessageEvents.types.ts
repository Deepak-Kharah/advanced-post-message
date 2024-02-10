export enum EditorPostMessageNature {
    ACK = "ACK",
    RESPONSE = "RESPONSE",
    REQUEST = "REQUEST",
}

export interface AdvPostMessageErrorObject {
    code: string;
    message: string;
}
export interface EditorRequestEventMessage {
    eventManager: "advanced-post-message";
    metadata: {
        hash: string;
        nature: EditorPostMessageNature;
    };
    channel: string;
    payload: any;
    error: undefined | AdvPostMessageErrorObject;
    type: string;
}

export interface PostMessageSendOptions {
    hash: string;
    error: undefined | AdvPostMessageErrorObject;
    payload: any;
    type: string;
}
