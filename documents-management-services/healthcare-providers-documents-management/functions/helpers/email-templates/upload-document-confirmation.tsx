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
  } from '@react-email/components';
  import { Tailwind } from '@react-email/tailwind';
  import * as React from 'react';
  
  interface UploadDocumentConfirmationEmailPropTypes {
    companyName?: string;
    name?: string;
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
  
  export const  UploadDocumentConfirmationEmailTemplate = ({
    companyName,
    name,
    address,
    email,
    subject,
    year,
    helpPageLink,
    xLink,
    youtubeLink,
    instagramLink,
    linkedInLink,
    documentName,
    confirmationNumber,
    supportEmail
  }: UploadDocumentConfirmationEmailPropTypes) => {
    const previewText = subject;
    const mailtoLink = `mailto:${supportEmail}`
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white my-auto mx-auto font-sans px-2">
            <Container className="border my-[40px] mx-auto py-[20px] max-w-[465px] ">
              <Section className="bg-[#FFFFFF] py-[30px] px-[10px] text-center">
                <Img
                  src="cid:logoImage"
                  width="128"
                  alt="Logo"
                  className="my-0 mx-auto text-center"
                />
              </Section>
              <Section className="mx-auto text-center">
                <Text className="text-white text-[28px] font-bold leading-[38.14px] text-center">
                  Document Upload Successful
                </Text>
                <Text className="text-black text-[14px] leading-[24px] text-center">
                  Hello, {name}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] text-center">
                  Your document {documentName} has been uploaded successfully. Your unique submission reference number is {confirmationNumber}. You can use this reference number to track the status of your documents within the portal.
                </Text>
                <Text className="text-black text-[14px] leading-[24px] text-center">
                  Please expect to receive an update regarding the review process within the next 3-5 business days.
                </Text>
              </Section>
              <Section className="text-center mt-[20px] mb-[20px] bg-[#f3f8f8]">
                <Text className="text-blue-900 text-[24px]">{email}</Text>
              </Section>
              <Section className="text-center">
                <Text className="text-black text-[14px] leading-[24px]">
                  Need help? Ask at{' '}
                  <Link
                    href={mailtoLink}
                    className="text-blue-600 no-underline"
                  >
                    {supportEmail}{' '}
                  </Link>
                  or visit our
                  <Link
                    href={helpPageLink}
                    className="text-blue-600 no-underline"
                  >
                    {' '}
                    Help Center
                  </Link>
                </Text>
                <Text className="text-black text-[18px] leading-[24px] text-bold mt-[10px]">
                  {companyName}
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                  {address}
                </Text>
              </Section>
  
              <Row className="mx-auto px-[50px] mt-[20px]">
                <Column className="mx-auto">
                  <Link href={xLink}>
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
                  <Link href={youtubeLink}>
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
                  <Link href={instagramLink}>
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
                  <Link href={linkedInLink}>
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
                All rights reserved. Copyright @{year} [Company]
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  };

  export default UploadDocumentConfirmationEmailTemplate;
  