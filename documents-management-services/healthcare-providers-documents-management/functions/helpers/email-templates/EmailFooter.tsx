import {
    Section,
    Row,
    Column,
    Link,
    Img,
    Hr,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface EmailFooterProps {
    companyName?: string;
    address?: string;
    year?: string;
    helpPageLink?: string;
    supportEmail?: string;
    xLink?: string;
    youtubeLink?: string;
    instagramLink?: string;
    linkedInLink?: string;
  }
  
// Component for displaying brand-styled footer content in the branded emails
const EmailFooter: React.FC<EmailFooterProps> = ({
    companyName,
    address,
    year,
    helpPageLink,
    supportEmail,
    xLink,
    youtubeLink,
    instagramLink,
    linkedInLink,
}) => {
    const mailtoLink = `mailto:${supportEmail}`;
    return (
      <Section className="text-center">
        <Text className="text-black text-[14px] leading-[24px]">
          Need help? Ask at{' '}
          <Link href={mailtoLink} className="text-blue-600 no-underline">
            {supportEmail}{' '}
          </Link>
          or visit our
          <Link href={helpPageLink} className="text-blue-600 no-underline">
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
      </Section>
    );
  };
  
  export default EmailFooter;
  