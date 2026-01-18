ALTER TABLE "address" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "food" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "address_deleted_at_idx" ON "address" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "category_deleted_at_idx" ON "category" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "food_deleted_at_idx" ON "food" USING btree ("deleted_at");