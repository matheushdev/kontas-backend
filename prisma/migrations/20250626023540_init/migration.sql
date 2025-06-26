-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('admin', 'member');

-- CreateTable
CREATE TABLE "tab_users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(10) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "profile_picture" TEXT,
    "user_type" "UserType" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tab_categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "CategoryType" NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tab_cards_accounts" (
    "card_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "bank_name" VARCHAR(100),
    "last_digits" VARCHAR(4),
    "color" VARCHAR(7),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_cards_accounts_pkey" PRIMARY KEY ("card_account_id")
);

-- CreateTable
CREATE TABLE "tab_expenses" (
    "expense_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "card_account_id" INTEGER NOT NULL,
    "annotation" TEXT,
    "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_expenses_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "tab_expense_owners" (
    "expense_owner_id" SERIAL NOT NULL,
    "expense_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) DEFAULT 100.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_expense_owners_pkey" PRIMARY KEY ("expense_owner_id")
);

-- CreateTable
CREATE TABLE "tab_incomes" (
    "income_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "card_account_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "annotation" TEXT,
    "income_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_incomes_pkey" PRIMARY KEY ("income_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tab_users_username_key" ON "tab_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tab_users_email_key" ON "tab_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tab_users_phone_key" ON "tab_users"("phone");

-- CreateIndex
CREATE INDEX "tab_users_username_idx" ON "tab_users"("username");

-- CreateIndex
CREATE INDEX "tab_users_email_idx" ON "tab_users"("email");

-- CreateIndex
CREATE INDEX "tab_categories_name_idx" ON "tab_categories"("name");

-- CreateIndex
CREATE INDEX "tab_categories_type_idx" ON "tab_categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tab_categories_name_type_key" ON "tab_categories"("name", "type");

-- CreateIndex
CREATE INDEX "tab_cards_accounts_user_id_idx" ON "tab_cards_accounts"("user_id");

-- CreateIndex
CREATE INDEX "tab_cards_accounts_type_idx" ON "tab_cards_accounts"("type");

-- CreateIndex
CREATE INDEX "tab_expenses_category_id_idx" ON "tab_expenses"("category_id");

-- CreateIndex
CREATE INDEX "tab_expenses_card_account_id_idx" ON "tab_expenses"("card_account_id");

-- CreateIndex
CREATE INDEX "tab_expenses_expense_date_idx" ON "tab_expenses"("expense_date");

-- CreateIndex
CREATE INDEX "tab_expenses_created_at_idx" ON "tab_expenses"("created_at");

-- CreateIndex
CREATE INDEX "tab_expense_owners_expense_id_idx" ON "tab_expense_owners"("expense_id");

-- CreateIndex
CREATE INDEX "tab_expense_owners_user_id_idx" ON "tab_expense_owners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tab_expense_owners_expense_id_user_id_key" ON "tab_expense_owners"("expense_id", "user_id");

-- CreateIndex
CREATE INDEX "tab_incomes_category_id_idx" ON "tab_incomes"("category_id");

-- CreateIndex
CREATE INDEX "tab_incomes_card_account_id_idx" ON "tab_incomes"("card_account_id");

-- CreateIndex
CREATE INDEX "tab_incomes_user_id_idx" ON "tab_incomes"("user_id");

-- CreateIndex
CREATE INDEX "tab_incomes_income_date_idx" ON "tab_incomes"("income_date");

-- CreateIndex
CREATE INDEX "tab_incomes_created_at_idx" ON "tab_incomes"("created_at");

-- AddForeignKey
ALTER TABLE "tab_cards_accounts" ADD CONSTRAINT "tab_cards_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tab_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_expenses" ADD CONSTRAINT "tab_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tab_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_expenses" ADD CONSTRAINT "tab_expenses_card_account_id_fkey" FOREIGN KEY ("card_account_id") REFERENCES "tab_cards_accounts"("card_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_expense_owners" ADD CONSTRAINT "tab_expense_owners_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "tab_expenses"("expense_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_expense_owners" ADD CONSTRAINT "tab_expense_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tab_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_incomes" ADD CONSTRAINT "tab_incomes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tab_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_incomes" ADD CONSTRAINT "tab_incomes_card_account_id_fkey" FOREIGN KEY ("card_account_id") REFERENCES "tab_cards_accounts"("card_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_incomes" ADD CONSTRAINT "tab_incomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tab_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
