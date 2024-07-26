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
import { UploadDocumentNotificationEmailPropsType } from '../../types/email-types';

export const UploadDocumentNotificationEmailTemplate = ({
  subject,
  userName,
  documentType,
  documentAccessPath,
  companyDetails
}: UploadDocumentNotificationEmailPropsType) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
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
                {userName} has submitted <b>{documentType}</b> document for review. 
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Please begin the review process at your earliest convenience.
                You can access the submitted documents via the following link: {documentAccessPath}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Thank you for your cooperation.
              </Text>
            </Section>
            
            <EmailFooter companyDetails={companyDetails} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default UploadDocumentNotificationEmailTemplate;
