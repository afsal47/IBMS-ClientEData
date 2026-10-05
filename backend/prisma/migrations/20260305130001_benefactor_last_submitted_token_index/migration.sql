IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'BenefactorEdata_LastSubmittedFormToken_key'
      AND object_id = OBJECT_ID(N'[general].[BenefactorEdata]')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [BenefactorEdata_LastSubmittedFormToken_key]
    ON [general].[BenefactorEdata]([LastSubmittedFormToken])
    WHERE [LastSubmittedFormToken] IS NOT NULL;
END;
