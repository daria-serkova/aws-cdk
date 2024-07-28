

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
export const HighlightTextEmailTemplate = (subject: string, content: string, footerDetails: EmailFooterDetails) => {
  const otpCodeRegex = /{{highlight}}/;
  const contentParts = content.split(otpCodeRegex);
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
                {contentParts[0]}
              </Markdown>
              <Section className="text-center mt-[20px] mb-[20px] bg-[#f3f8f8]">
                <Text className="text-blue-900 text-[32px] tracking-[10px] font-bold">
                  {'{{highlight}}'}
                </Text>
              </Section>
              <Markdown className="text-blue-900 text-[24px]">
                {contentParts[1]}
              </Markdown>
            </Section>
            <EmailFooter footerDetails={footerDetails} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default HighlightTextEmailTemplate;
