// @ts-nocheck

import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
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
export const HighlightTextEmailTemplate = (subject: string, content: string, footerDetails: {
  helpText: string,
  companyName: string,
  logo: string,
  copyright: string,
  address: string,
  socilalLinks: {
    facebookUrl: string,
    twitterUrl: string,
    linkedinUrl: string,
    instagramUrl: string
  }
}) => {
  const otpCodeRegex = /{{highlight}}/;
  const contentParts = content.split(otpCodeRegex);
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border my-[40px] mx-auto py-[20px] ">
            <Section className="bg-[#000000] py-[30px] px-[10px]">
              <Img
                src="cid:logoImage"
                width="128"
                // height="37"
                alt="dhsLogo"
                className="my-0 mx-auto text-center"
              />
            </Section>
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

export default HighlightTextEmailTemplate;
