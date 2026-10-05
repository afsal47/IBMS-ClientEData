IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'BenefactorEdata_FormToken_key'
      AND object_id = OBJECT_ID(N'[general].[BenefactorEdata]')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [BenefactorEdata_FormToken_key]
    ON [general].[BenefactorEdata]([FormToken])
    WHERE [FormToken] IS NOT NULL;
END;
