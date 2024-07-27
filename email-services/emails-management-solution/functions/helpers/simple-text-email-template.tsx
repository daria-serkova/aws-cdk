
// @ts-nocheck
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Markdown,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import EmailHeader from './EmailHeader';
import EmailFooter from './EmailFooter';
import { EmailFooterDetails } from './emails';

export const SimpleTextEmailTemplate = (subject: string, content: string, footerDetails: EmailFooterDetails) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border my-[40px] mx-auto py-[20px] ">
            <EmailHeader />
            <Section className="mx-auto text-center">
              <Text className="text-black text-[28px] font-bold leading-[38.14px] text-center">
                {subject}
              </Text>
            </Section>
            <Section className="mt-[20px] mb-[20px] bg-[#FFFFFF]">
              <Markdown className="text-blue-900 text-[24px]">
                {content}
              </Markdown>
            </Section>
            <Section className="text-center">
              <Markdown className="text-black text-[14px] leading-[24px]">
                {footerDetails.helpText}
              </Markdown>
              <Text className="text-black text-[18px] leading-[24px] text-bold mt-[10px]">
                {footerDetails.companyName}
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                {footerDetails.address}
              </Text>
            </Section>
            <EmailFooter footerDetails={footerDetails} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SimpleTextEmailTemplate;
