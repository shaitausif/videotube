// Here we're using React Email which is A collection of high-quality, unstyled components for creating beautiful emails using React and TypeScript.

import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
    Button,
  } from '@react-email/components';
  

//   It's the template for email
  export default function SubscriptionExpiryEmail({username }: {
    username : string
  }) {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <title>Your Premium plan of VideoTube has been expired!</title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Section>
          <Row>
            <Heading as="h2">Hello {username},</Heading>
          </Row>
          <Row>
            <Text>
              Thanks for giving attention to this message, It is to remind you that your premium plan of VideoTube has been expired and you can no longer user Exclusive services of our Platform, So Want to upgrade your plan again! I know your answer is YES!
            </Text>
          </Row>

          <Row>
            <Text>
              Upgrade here to be a part of the Revolution again
            </Text>
          </Row>
           <Row>
            <Button
              href={`http://localhost:3000/upgrade`}
              style={{ color: '#61dafb' }}
            >
              Click here
            </Button>
          </Row> 
        </Section>
      </Html>
    );
  }