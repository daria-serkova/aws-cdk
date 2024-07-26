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
import { EmailPropsType } from '../../types/email-types';
  
// Component for displaying brand-styled footer content in the branded emails
const EmailFooter: React.FC<EmailPropsType> = ({
    companyDetails,
}) => {
    const mailtoLink = `mailto:${companyDetails.contactEmail}`;
    return (
      <Section className="text-center">
        <Text className="text-black text-[14px] leading-[24px]">
          Need help? Ask at{' '}
          <Link href={mailtoLink} className="text-blue-600 no-underline">
            {companyDetails.contactEmail}{' '}
          </Link>
          or visit our
          <Link href={companyDetails.helpPageLink} className="text-blue-600 no-underline">
            {' '}
            Help Center
          </Link>
        </Text>
        <Text className="text-black text-[18px] leading-[24px] text-bold mt-[10px]">
          {companyDetails.companyName}
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
          {companyDetails.address}
        </Text>
        <Row className="mx-auto px-[50px] mt-[20px]">
          <Column className="mx-auto">
            <Link href={companyDetails.twitterUrl}>
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
            <Link href={companyDetails.youtubeUrl}>
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
            <Link href={companyDetails.instagramUrl}>
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
            <Link href={companyDetails.linkedinUrl}>
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
          All rights reserved. Copyright @{companyDetails.year} [Company]
        </Text>
      </Section>
    );
  };
  
  export default EmailFooter;
  