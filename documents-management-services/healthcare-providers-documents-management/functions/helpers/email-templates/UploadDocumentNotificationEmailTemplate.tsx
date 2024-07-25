// @ts-nocheck
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import EmailHeader from './EmailHeader';
import EmailFooter from './EmailFooter';

interface UploadDocumentConfirmationEmailPropTypes {
  companyName?: string;
  address?: string;
  year?: string;
  helpPageLink?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  subject?: string;
  documentName?: string;
  confirmationNumber?: string;
  supportEmail?: string;
}

export const UploadDocumentNotificationEmailTemplate = ({
  companyName,
  address,
  email,
  subject,
  year,
  helpPageLink,
  xLink,
  youtubeLink,
  instagramLink,
  linkedInLink,
  supportEmail,
}: UploadDocumentConfirmationEmailPropTypes) => {
  const previewText = subject;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border my-[40px] mx-auto py-[20px] max-w-[465px] ">
            <EmailHeader logoSrc="cid:logoImage" />

            <Section className="mx-auto text-center">
              <Text className="text-black text-[28px] font-bold leading-[38.14px] text-center">
                {subject}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Dear Documents Verification Team,
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Dr. Emily Johnson has submitted her credentialing documents for review. 
                Below is a summary of the documents submitted:
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Please begin the review process at your earliest convenience. You can access the submitted documents via the following link: [Document Management System Link]
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Thank you for your cooperation.
              </Text>
            </Section>
            
            <EmailFooter
              companyName={companyName}
              address={address}
              year={year}
              helpPageLink={helpPageLink}
              supportEmail={supportEmail}
              xLink={xLink}
              youtubeLink={youtubeLink}
              instagramLink={instagramLink}
              linkedInLink={linkedInLink}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default UploadDocumentNotificationEmailTemplate;
