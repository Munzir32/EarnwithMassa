const NEXT_PUBLIC_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;

if (!NEXT_PUBLIC_PINATA_JWT) {
  throw new Error("Pinata JWT is not defined in the environment variables.");
}

export async function pinFileWithPinata(file: File) {
  if(!file) {
    throw new Error("File is required")
  }
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: data,
  });

  const result = (await res.json()) as { IpfsHash: string };

  return `ipfs://${result.IpfsHash}`;
}

export async function pinJsonWithPinata(json: object) {
  const data = JSON.stringify({
    pinataContent: json,
    pinataMetadata: {
      name: "metadata.json",
    },
  });

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: data,
  });

  const result = (await res.json()) as { IpfsHash: string };

  return `ipfs://${result.IpfsHash}`;
}