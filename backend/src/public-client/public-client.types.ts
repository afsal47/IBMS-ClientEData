export type PublicClientReadOnlyInfo = {
  code: string;
  name: string;
  address: string | null;
};

export type PublicClientEditableFields = {
  country: string | null;
  state: string | null;
  city: string | null;
  fax: string | null;
  trn: string | null;
  website: string | null;
  legalName: string | null;
  tradingName: string | null;
  tin: string | null;
  tradeLicenseNo: string | null;
  tradeLicenseType: string | null;
  tradeLicenseAuthority: string | null;
  endpointId: string | null;
  endpointScheme: string | null;
  postalCode: string | null;
};

export type PublicClientFormResponse = PublicClientReadOnlyInfo &
  PublicClientEditableFields;

export type PublicClientAlreadySubmittedResponse = PublicClientReadOnlyInfo & {
  alreadySubmitted: true;
  message: string;
};
