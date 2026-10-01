BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'general') EXEC sp_executesql N'CREATE SCHEMA [general];';

-- CreateTable
CREATE TABLE [general].[BenefactorEdata] (
    [UID] INT NOT NULL IDENTITY(1,1),
    [Code] VARCHAR(20) NOT NULL,
    [Name] VARCHAR(150) NOT NULL,
    [Address] VARCHAR(200),
    [City] INT,
    [ContactPerson] VARCHAR(100),
    [Phone] VARCHAR(50),
    [Email] VARCHAR(100),
    [Company] INT,
    [FYear] INT,
    [Deleted] BIT NOT NULL CONSTRAINT [BenefactorEdata_Deleted_df] DEFAULT 0,
    [User] INT,
    [ScanID] UNIQUEIDENTIFIER,
    [InsertedOn] DATETIME2,
    [InsertedBy] INT,
    [Host] VARCHAR(50),
    [Version] VARBINARY(max),
    [BenefactorType] INT,
    [Country] INT,
    [Fax] VARCHAR(50),
    [TRN] VARCHAR(20),
    [Website] VARCHAR(50),
    [LegalName] VARCHAR(200),
    [TradingName] VARCHAR(200),
    [TIN] VARCHAR(50),
    [TradeLicenseNo] VARCHAR(100),
    [TradeLicenseType] VARCHAR(100),
    [TradeLicenseAuthority] VARCHAR(200),
    [EndpointID] VARCHAR(100),
    [EndpointScheme] VARCHAR(100),
    [State] INT,
    [PostalCode] VARCHAR(20),
    CONSTRAINT [BenefactorEdata_pkey] PRIMARY KEY CLUSTERED ([UID])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
