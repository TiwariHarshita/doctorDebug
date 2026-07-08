-- CreateTable
CREATE TABLE "UserAiProviderSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "baseUrl" TEXT,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyPreview" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAiProviderSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAiProviderSetting_userId_idx" ON "UserAiProviderSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAiProviderSetting_userId_provider_key" ON "UserAiProviderSetting"("userId", "provider");

-- AddForeignKey
ALTER TABLE "UserAiProviderSetting" ADD CONSTRAINT "UserAiProviderSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
