import { pinFileWithPinata, pinJsonWithPinata } from "./pinata";
import { TaskFormState, SubmissionType } from "./typs";

export async function PlatformIPFS({
    title,
    description,
   tokenSymbol
  }: TaskFormState) {
   
    const metadataJson = {
      title, description,  tokenSymbol
    };
   
    const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
   
    return contractMetadataJsonUri;
  }


  export async function submit({
    submissionLink
  }: SubmissionType) {
   
    const metadataJson = {
      submissionLink
    };
   
    const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
   
    return contractMetadataJsonUri;
  }





