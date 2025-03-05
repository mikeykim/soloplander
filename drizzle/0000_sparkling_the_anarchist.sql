CREATE TABLE IF NOT EXISTS "solopreneur_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"solopreneur_id" serial NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "solopreneur_previews" (
	"id" serial PRIMARY KEY NOT NULL,
	"solopreneur_id" serial NOT NULL,
	"platform" varchar(50) NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "solopreneurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"region" varchar(50) NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL,
	"gender" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "solopreneur_links" ADD CONSTRAINT "solopreneur_links_solopreneur_id_solopreneurs_id_fk" FOREIGN KEY ("solopreneur_id") REFERENCES "solopreneurs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "solopreneur_previews" ADD CONSTRAINT "solopreneur_previews_solopreneur_id_solopreneurs_id_fk" FOREIGN KEY ("solopreneur_id") REFERENCES "solopreneurs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
