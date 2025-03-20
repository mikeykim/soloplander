CREATE TABLE IF NOT EXISTS "solopreneur_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"solopreneur_id" serial NOT NULL,
	"keyword" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "solopreneur_keywords" ADD CONSTRAINT "solopreneur_keywords_solopreneur_id_solopreneurs_id_fk" FOREIGN KEY ("solopreneur_id") REFERENCES "solopreneurs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
