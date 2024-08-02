import { config } from 'dotenv';
config();
/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';

export const EventCodes = {
    UPLOAD: "Upload",                         // When a document is uploaded.
    METADATA_UPDATE: "Metadata Update",       // When a document's metadata is updated.
    DELETE: "Delete",                         // When a document is deleted.
    VIEW: "View",                             // When a document is viewed.
    DOWNLOAD: "Download",                     // When a document is downloaded.
    VERIFY: "Verify",                         // When a document is verified.
    REJECT: "Reject",                         // When a document is rejected.
    RENAME: "Rename",                         // When a document is renamed.
    MOVE: "Move",                             // When a document is moved to a different location.
    SHARE: "Share",                           // When a document is shared with another user.
    PERMISSION_CHANGE: "Permission Change",   // When a document's permissions are changed.
    LOCK: "Lock",                             // When a document is locked.
    UNLOCK: "Unlock",                         // When a document is unlocked.
    ARCHIVE: "Archive",                       // When a document is archived.
    RESTORE: "Restore",                       // When a document is restored from archive.
    TAG: "Tag",                               // When a document is tagged.
    UNTAG: "Untag",                           // When a tag is removed from a document.
    ACCESS_REQUEST: "Access Request",         // When a request for document access is made.
    ACCESS_APPROVE: "Access Approve",         // When a request for document access is approved.
    ACCESS_DENY: "Access Deny",               // When a request for document access is denied.
    SIGN: "Sign",                             // When a document is signed.
    UNSIGN: "Unsign",                         // When a signature is removed from a document.
    COMMENT: "Comment",                       // When a comment is added to a document.
    COMMENT_UPDATE: "Comment Update",         // When a comment on a document is updated.
    COMMENT_DELETE: "Comment Delete",         // When a comment on a document is deleted.
    CHECKOUT: "Checkout",                     // When a document is checked out for editing.
    CHECKIN: "Checkin",                       // When a document is checked in after editing.
    REVIEW_SUBMIT: "Review Submit",           // When a document is submitted for review.
    REVIEW_COMPLETE: "Review Complete",       // When a document review is completed.
    RETENTION_SET: "Retention Set",           // When a retention policy is set for a document.
    RETENTION_REMOVE: "Retention Remove",     // When a retention policy is removed from a document.
    EXPIRATION_SET: "Expiration Set",         // When an expiration date is set for a document.
    EXPIRATION_REMOVE: "Expiration Remove",   // When an expiration date is removed from a document.
    PRINT: "Print",                           // When a document is printed.
    IMPORT: "Import",                         // When a document is imported from another system.
    EXPORT: "Export",                         // When a document is exported to another system.
    ANNOTATE: "Annotate",                     // When a document is annotated.
    ANNOTATION_REMOVE: "Annotation Remove"    // When an annotation is removed from a document.
};