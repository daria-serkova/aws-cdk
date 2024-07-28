import {
    Column,
    Hr,
    Img,
    Link,
    Row,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
import { EmailFooterDetails } from './emails';

const EmailFooter: React.FC<{ footerDetails: EmailFooterDetails }> = ({ footerDetails }) => {
    return (
        <>
        <Row className="mx-auto px-[50px] mt-[20px]">
              <Column className="mx-auto">
                <Link href={footerDetails.socialLinks.twitterUrl}>
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
                <Link href={footerDetails.socialLinks.youtubeUrl}>
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
                <Link href={footerDetails.socialLinks.instagramUrl}>
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
                <Link href={footerDetails.socialLinks.linkedinUrl}>
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
            </>
    );
  };
  export default EmailFooter;
  