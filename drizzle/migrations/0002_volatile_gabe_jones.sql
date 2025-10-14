CREATE TABLE "summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"model" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "summaries_note_id_idx" ON "summaries" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "summaries_created_at_idx" ON "summaries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "summaries_note_created_idx" ON "summaries" USING btree ("note_id","created_at");