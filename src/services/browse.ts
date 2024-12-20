import ky from 'ky';

const JINA_API_ENDPOINT = 'https://r.jina.ai/';
const JINA_API_KEY = process.env.JINA_API_KEY;

export type BrowseResult = {
  url: string;
  title?: string;
  content: string;
};

// This method is needed because calling the browse method directly is not supported on vercel's edge env. So we'll host browse under a normal node route, and the edge route (via inngest) call it.
export async function browse(params: {
  url: string;
  maxContentLen?: number;
  slowFallback?: boolean;
}): Promise<BrowseResult | undefined> {
  try {
    const res = await ky(`${JINA_API_ENDPOINT}${params.url}`, {
      headers: {
        Authorization: `Bearer ${JINA_API_TOKEN}`,
        'X-Return-Format': 'markdown',
        Accept: 'application/json',
      },
    });
    const { title, content } = (await res.json()).data;
    return { title, content, url: params.url };
  } catch (e: any) {
    console.error('Error calling browse endpoint', params, e.message);
    return;
  }
}

// {
//   "code": 200,
//   "status": 20000,
//   "data": {
//     "title": "Example Domain",
//     "description": "",
//     "url": "https://example.com/",
//     "content": "Example Domain\n===============\n    \n\nExample Domain\n==============\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.\n\n[More information...](https://www.iana.org/domains/example)",
//     "usage": {
//       "tokens": 52
//     }
//   }
// }
