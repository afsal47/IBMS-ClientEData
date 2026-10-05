BEGIN TRY
BEGIN TRAN;

IF COL_LENGTH('general.BenefactorEdata', 'FormToken') IS NULL
BEGIN
    ALTER TABLE [general].[BenefactorEdata] ADD [FormToken] VARCHAR(36) NULL;
END;

IF COL_LENGTH('general.BenefactorEdata', 'FormTokenExpiresAt') IS NULL
BEGIN
    ALTER TABLE [general].[BenefactorEdata] ADD [FormTokenExpiresAt] DATETIME2 NULL;
END;

IF COL_LENGTH('general.BenefactorEdata', 'IsFormCompleted') IS NULL
BEGIN
    ALTER TABLE [general].[BenefactorEdata] ADD [IsFormCompleted] BIT NOT NULL CONSTRAINT [BenefactorEdata_IsFormCompleted_df] DEFAULT 0;
END;

COMMIT TRAN;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW;
END CATCH;
