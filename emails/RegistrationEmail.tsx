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
  export default function RegistraionEmail({ email , username }: {
    email : string,
    username : string
  }) {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <title>Registered Successfully</title>
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
              Thank you for registering in our Platform VideoTube, An exclusive social media platform where you can create content for your subscribers and you can watch content from your favourite VideoTuber with AI assistant that will guide you on each step.
            </Text>
          </Row>

          <Row>
            <Text>
              See Your Profile
            </Text>
          </Row>
           <Row>
            <Button
              href={`http://localhost:3000/c/${username}`}
              style={{ color: '#61dafb' }}
            >
              Click here
            </Button>
          </Row> 
        </Section>
      </Html>
    );
  }