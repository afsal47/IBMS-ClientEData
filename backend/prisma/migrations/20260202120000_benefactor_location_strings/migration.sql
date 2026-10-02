-- Country, State, City: store selected location names (no master lookup IDs).
BEGIN TRY
BEGIN TRAN;

-- Existing INT values become string digits; new saves use location names from the client form.
ALTER TABLE [general].[BenefactorEdata] ALTER COLUMN [Country] NVARCHAR(100) NULL;
ALTER TABLE [general].[BenefactorEdata] ALTER COLUMN [State] NVARCHAR(100) NULL;
ALTER TABLE [general].[BenefactorEdata] ALTER COLUMN [City] NVARCHAR(150) NULL;

COMMIT TRAN;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW;
END CATCH
