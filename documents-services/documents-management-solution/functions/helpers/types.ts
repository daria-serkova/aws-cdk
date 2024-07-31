export interface DocumentMetadata {
    documentId: string;
    documentOwnerId: string;
    documentCategory: string;
    uploadedAt: string;
    key: string;
    [key: string]: any; 
}

export interface AuditEvent {
    event: string,
    eventTimestamp: string,
    eventInitiator: string,
    eventObject: string
}