import { FC } from 'react';
import Head from 'next/head';

export type SchemaData = {
  [key: string]: any;
};

interface SchemaMarkupProps {
  type: string;
  data: SchemaData;
}

const SchemaMarkup: FC<SchemaMarkupProps> = ({ type, data }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </Head>
  );
};

export default SchemaMarkup; 