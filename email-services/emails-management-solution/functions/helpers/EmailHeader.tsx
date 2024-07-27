import {
    Img,
    Section,
  } from '@react-email/components';
  import * as React from 'react';
const EmailHeader = () => {
    return (
        <Section className="bg-[#000000] py-[30px] px-[10px]">
            <Img
                src="cid:logoImage"
                width="128"
                // height="37"
                alt="dhsLogo"
                className="my-0 mx-auto text-center"
            />
        </Section>
    );
  };
  
  export default EmailHeader;
  