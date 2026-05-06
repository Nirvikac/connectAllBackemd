export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_CONVERSATION: 'conversation:join',
    LEAVE_CONVERSATION: 'conversation:leave',
    MESSAGE_SEND: 'message:send',
    MESSAGE_NEW: 'message:new',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    PERSENCE_UPDATE: 'presence:update',
} as const;

export interface JoinPayload {
    conversationId: string;
}
export interface TypingPayload {
    conversationId: string;
 }