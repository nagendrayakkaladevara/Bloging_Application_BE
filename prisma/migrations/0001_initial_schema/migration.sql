-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "author" VARCHAR(255),
    "cover_image_url" TEXT,
    "published_at" TIMESTAMP(6),
    "read_time" INTEGER,
    "layout_type" VARCHAR(50) NOT NULL DEFAULT 'single-column',
    "max_width" VARCHAR(50) NOT NULL DEFAULT '800px',
    "show_table_of_contents" BOOLEAN NOT NULL DEFAULT false,
    "enable_voting" BOOLEAN NOT NULL DEFAULT true,
    "enable_social_share" BOOLEAN NOT NULL DEFAULT true,
    "enable_comments" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(50) NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_blocks" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "block_type" VARCHAR(50) NOT NULL,
    "block_order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_tags" (
    "blog_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("blog_id","tag_id")
);

-- CreateTable
CREATE TABLE "blog_links" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "link_type" VARCHAR(50) NOT NULL DEFAULT 'external',
    "link_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_votes" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "ip_address" VARCHAR(45),
    "session_id" VARCHAR(255),
    "vote_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "start_time" VARCHAR(10),
    "end_time" VARCHAR(10),
    "color" VARCHAR(50) NOT NULL DEFAULT 'blue',
    "blog_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "status" VARCHAR(50) NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" UUID NOT NULL,
    "ip_address" VARCHAR(45),
    "query" TEXT NOT NULL,
    "results_count" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_slug_idx" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_status_idx" ON "blogs"("status");

-- CreateIndex
CREATE INDEX "blogs_published_at_idx" ON "blogs"("published_at");

-- CreateIndex
CREATE INDEX "blogs_created_at_idx" ON "blogs"("created_at");

-- CreateIndex
CREATE INDEX "blog_blocks_blog_id_idx" ON "blog_blocks"("blog_id");

-- CreateIndex
CREATE INDEX "blog_blocks_blog_id_block_order_idx" ON "blog_blocks"("blog_id", "block_order");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "blog_tags_blog_id_idx" ON "blog_tags"("blog_id");

-- CreateIndex
CREATE INDEX "blog_tags_tag_id_idx" ON "blog_tags"("tag_id");

-- CreateIndex
CREATE INDEX "blog_links_blog_id_idx" ON "blog_links"("blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_votes_blog_id_ip_address_session_id_key" ON "blog_votes"("blog_id", "ip_address", "session_id");

-- CreateIndex
CREATE INDEX "blog_votes_blog_id_idx" ON "blog_votes"("blog_id");

-- CreateIndex
CREATE INDEX "blog_votes_ip_address_idx" ON "blog_votes"("ip_address");

-- CreateIndex
CREATE INDEX "calendar_events_event_date_idx" ON "calendar_events"("event_date");

-- CreateIndex
CREATE INDEX "calendar_events_blog_id_idx" ON "calendar_events"("blog_id");

-- CreateIndex
CREATE INDEX "comments_blog_id_idx" ON "comments"("blog_id");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "comments_blog_id_status_idx" ON "comments"("blog_id", "status");

-- CreateIndex
CREATE INDEX "search_history_ip_address_idx" ON "search_history"("ip_address");

-- CreateIndex
CREATE INDEX "search_history_created_at_idx" ON "search_history"("created_at");

-- AddForeignKey
ALTER TABLE "blog_blocks" ADD CONSTRAINT "blog_blocks_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_links" ADD CONSTRAINT "blog_links_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_votes" ADD CONSTRAINT "blog_votes_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX idx_blogs_title_fts ON blogs USING gin(to_tsvector('english', title));
CREATE INDEX idx_blogs_description_fts ON blogs USING gin(to_tsvector('english', description));
CREATE INDEX idx_tags_name_fts ON tags USING gin(to_tsvector('english', name));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (Prisma handles this automatically, but keeping for compatibility)
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_blocks_updated_at BEFORE UPDATE ON blog_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_votes_updated_at BEFORE UPDATE ON blog_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
