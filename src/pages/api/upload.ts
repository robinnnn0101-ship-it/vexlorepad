import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return res.status(500).json({ error: 'PINATA_JWT is not configured' });
  }

  try {
    const {
      tokenLogo,
      tokenName,
      tokenSymbol,
      description,
      twitter,
      telegram,
      website,
    } = req.body;

    if (!tokenLogo || !tokenName || !tokenSymbol) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Upload image to Pinata
    const imageForm = new FormData();
    const logoFile = base64ToFile(tokenLogo, `${Date.now()}-logo`);
    imageForm.append('file', logoFile);
    imageForm.append('network', 'public');

    const imageRes = await fetch('https://uploads.pinata.cloud/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: imageForm,
    });

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({}));
      return res.status(imageRes.status).json({ error: err.error || 'Failed to upload image to Pinata' });
    }

    const imageJson = await imageRes.json();
    const imageCid = imageJson.data?.cid;
    if (!imageCid) {
      return res.status(500).json({ error: 'No image CID returned from Pinata' });
    }
    const imageUrl = `https://ipfs.io/ipfs/${imageCid}`;

    // 2. Upload metadata JSON to Pinata
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: description || '',
      image: imageUrl,
      showName: true,
      createdOn: 'https://vexlore.fun',
      twitter: twitter || '',
      telegram: telegram || '',
      website: website || '',
    };

    const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json', {
      type: 'application/json',
    });

    const metaForm = new FormData();
    metaForm.append('file', metadataFile);
    metaForm.append('network', 'public');

    const metaRes = await fetch('https://uploads.pinata.cloud/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: metaForm,
    });

    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      return res.status(metaRes.status).json({ error: err.error || 'Failed to upload metadata to Pinata' });
    }

    const metaJson = await metaRes.json();
    const metaCid = metaJson.data?.cid;
    if (!metaCid) {
      return res.status(500).json({ error: 'No metadata CID returned from Pinata' });
    }

    const metadataUri = `https://ipfs.io/ipfs/${metaCid}`;

    return res.status(200).json({
      success: true,
      metadataUri,
      imageUri: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred during upload',
    });
  }
}

function base64ToFile(base64: string, fileName: string): File {
  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }

  const [, contentType, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  return new File([buffer], fileName, { type: contentType });
}
