import { Section, Img } from '@react-email/components';
import * as React from 'react';

interface EmailHeaderProps {
  logoSrc: string;
}
// Component for displaying brand-styled header content in the branded emails
const EmailHeader: React.FC<EmailHeaderProps> = ({ logoSrc }) => (
  <Section className="bg-[#FFFFFF] py-[30px] px-[10px] text-center">
    <Img
      src={logoSrc}
      width="128"
      alt="Logo"
      className="my-0 mx-auto text-center"
    />
  </Section>
);
export default EmailHeader;
