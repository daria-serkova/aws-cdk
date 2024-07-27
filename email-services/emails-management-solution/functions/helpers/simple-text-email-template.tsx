// @ts-nocheck
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Markdown,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import EmailHeader from './EmailHeader';

export const SimpleTextEmailTemplate = (subject: string, content: string, footerDetails: {
  helpText: string,
  companyName: string,
  logo: string,
  copyright: string,
  address: string,
  socilalLinks: {
    facebookUrl: string,
    twitterUrl: string,
    linkedinUrl: string,
    instagramUrl: string,
    youtubeUrl: string
  }
}) => {
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
            <Row className="mx-auto px-[50px] mt-[20px]">
              <Column className="mx-auto">
                <Link href={footerDetails.socilalLinks.twitterUrl}>
                  <Img
                    src="cid:xIcon"
                    width="32"
                    height="32"
                    alt="X icon"
                    className="mx-auto"
                  />
                </Link>
              </Column>
              <Column>
                <Link href={footerDetails.socilalLinks.youtubeUrl}>
                  <Img
                    src="cid:youtubeIcon"
                    width="32"
                    height="32"
                    alt="youtube icon"
                    className="mx-auto"
                  />
                </Link>
              </Column>
              <Column>
                <Link href={footerDetails.socilalLinks.instagramUrl}>
                  <Img
                    src="cid:instagramIcon"
                    width="32"
                    height="32"
                    alt="instagram icon"
                    className="mx-auto"
                  />
                </Link>
              </Column>
              <Column>
                <Link href={footerDetails.socilalLinks.linkedinUrl}>
                  <Img
                    src="cid:linkedinIcon"
                    width="32"
                    height="32"
                    alt="linkedin icon"
                    className="mx-auto"
                  />
                </Link>
              </Column>
            </Row>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              {footerDetails.copyright}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SimpleTextEmailTemplate;
