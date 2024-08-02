/**
 * Represents the details of a user, who uploaded document in the system.
 */
 export interface DocumentOwner {
    documentOwnerId: string;
    documentOwnerEmail: string;
    documentOwnerName: string;
}
/**
 * Represents a document with associated details and metadata.
 */
export interface DocumentBase64 {
    initiatorSystemCode: string;
    documentOwner: DocumentOwner;
    documentName: string;
    documentFormat: string;
    documentSize: number;
    documentCategory: string;
    documentContent: string;
    metadata: any;
}



export interface DocumentMetadata {
    documentId: string;
    documentOwnerId: string;
    documentCategory: string;
    uploadedAt: string;
    key: string;
    [key: string]: any; 
}


export interface EmailNotification {
    templateId: string;
    locale: string; 
    recipient: string;
    emailData: object;
    initiatorSystemCode: string
}

//---------
export interface GetDocumentDetailsWorkflowData {
    initiatorSystemCode: string,
    documentId: string,
    requestorId: string,
    documentUrl?: string,
    metadata?: any,
    audit?: any
}
