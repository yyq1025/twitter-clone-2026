import { google } from "@ai-sdk/google";
import { generateText, stepCountIs } from "ai";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/db";
import { users } from "@/db/schema/better-auth";
import { posts } from "@/db/schema/post";
import { createPostWithSideEffects } from "@/server/create-post-service";

const MAX_POST_CONTENT_LENGTH = 280;
const NEWS_DEFAULT_WINDOW_DAYS = 7;

export type BotCreatePostWorkflowInput = {
  botUserId: string;
  replyRootId?: string | null;
  replyParentId?: string | null;
  triggerPostId?: string;
};

type PromptPostContext = {
  postId: string;
  content: string;
  creatorName: string;
  creatorUsername: string;
  createdAtIso: string;
};

type PromptContextSnapshot = {
  trigger: PromptPostContext;
  parent?: PromptPostContext;
  root?: PromptPostContext;
};

export async function handleBotCreatePost({
  botUserId,
  replyRootId = null,
  replyParentId = null,
  triggerPostId,
}: BotCreatePostWorkflowInput) {
  "use workflow";

  if (!triggerPostId) {
    throw new Error("triggerPostId is required for context-aware generation");
  }

  const contextSnapshot = await loadBotPromptContext({
    triggerPostId,
    replyParentId,
    replyRootId,
  });

  const content = await createBotPostContent({
    botUserId,
    contextSnapshot,
  });
  const txid = await createBotPost({
    botUserId,
    content,
    replyRootId,
    replyParentId,
  });

  return {
    status: "posted",
    botUserId,
    triggerPostId: triggerPostId,
    content,
    txid,
  };
}

function buildPromptSection(tag: string, context: PromptPostContext) {
  return `
<${tag}>
id: ${context.postId}
author_name: ${context.creatorName}
author_username: @${context.creatorUsername}
created_at: ${context.createdAtIso}
content:
"""${context.content}"""
</${tag}>
`.trim();
}

function buildContextPrompt(context: PromptContextSnapshot) {
  const sections = [
    buildPromptSection("trigger_post", context.trigger),
    context.parent ? buildPromptSection("parent_post", context.parent) : null,
    context.root ? buildPromptSection("root_post", context.root) : null,
  ].filter(Boolean);
  const todayUtc = new Date().toISOString().slice(0, 10);

  return `
<task>
Write one direct reply to the trigger post.
</task>

<rules>
- 1 to 2 sentences.
- Friendly and natural tone.
- Reply to the trigger post directly.
- Use parent/root posts only as background context.
- Do not invent facts beyond the provided context.
- Follow the language used in the trigger post.
- Call tool "google_search" only when the user explicitly asks for latest news/current events/real-time updates.
- If "latest" is requested without a time range, interpret it as the last ${NEWS_DEFAULT_WINDOW_DAYS} days.
- If no country/region is specified, use global scope.
- If no reliable latest information is found, clearly say you could not find reliable latest information and ask the user to narrow the topic or provide keywords.
- Do not include source links.
- No hashtags.
- No emojis.
- Plain text only.
- Keep within 280 characters.
</rules>

<runtime_context>
- today_utc: ${todayUtc}
- latest_default_window_days: ${NEWS_DEFAULT_WINDOW_DAYS}
- default_news_region: global
</runtime_context>

<post_context>
${sections.join("\n\n")}
</post_context>

<output_requirements>
Return only the final reply text.
</output_requirements>
`.trim();
}

async function loadBotPromptContext({
  triggerPostId,
  replyParentId,
  replyRootId,
}: {
  triggerPostId: string;
  replyParentId: string | null;
  replyRootId: string | null;
}) {
  "use step";

  const triggerUser = alias(users, "trigger_user");
  const parentPost = alias(posts, "parent_post");
  const parentUser = alias(users, "parent_user");
  const rootPost = alias(posts, "root_post");
  const rootUser = alias(users, "root_user");

  const [record] = await db
    .select({
      triggerPost: posts,
      triggerUser: triggerUser,
      parentPost: parentPost,
      parentUser: parentUser,
      rootPost: rootPost,
      rootUser: rootUser,
    })
    .from(posts)
    .innerJoin(triggerUser, eq(triggerUser.id, posts.creator_id))
    .leftJoin(
      parentPost,
      replyParentId ? eq(parentPost.id, replyParentId) : sql`false`,
    )
    .leftJoin(parentUser, eq(parentUser.id, parentPost.creator_id))
    .leftJoin(rootPost, replyRootId ? eq(rootPost.id, replyRootId) : sql`false`)
    .leftJoin(rootUser, eq(rootUser.id, rootPost.creator_id))
    .where(eq(posts.id, triggerPostId))
    .limit(1);

  if (!record) {
    throw new Error(`Trigger post not found: ${triggerPostId}`);
  }

  const trigger: PromptPostContext = {
    postId: record.triggerPost.id,
    content: record.triggerPost.content,
    creatorName: record.triggerUser.name,
    creatorUsername: record.triggerUser.username ?? "unknown",
    createdAtIso: record.triggerPost.created_at.toISOString(),
  };

  const parent: PromptPostContext | undefined =
    record.parentPost?.id && record.parentUser?.id
      ? {
          postId: record.parentPost.id,
          content: record.parentPost.content,
          creatorName: record.parentUser.name,
          creatorUsername: record.parentUser.username ?? "unknown",
          createdAtIso: record.parentPost.created_at.toISOString(),
        }
      : undefined;

  const root: PromptPostContext | undefined =
    record.rootPost?.id && record.rootUser?.id
      ? {
          postId: record.rootPost.id,
          content: record.rootPost.content,
          creatorName: record.rootUser.name,
          creatorUsername: record.rootUser.username ?? "unknown",
          createdAtIso: record.rootPost.created_at.toISOString(),
        }
      : undefined;

  return {
    trigger,
    parent,
    root,
  } satisfies PromptContextSnapshot;
}

async function createBotPostContent({
  botUserId,
  contextSnapshot,
}: {
  botUserId: string;
  contextSnapshot: PromptContextSnapshot;
}) {
  "use step";

  const startedAt = Date.now();

  try {
    const prompt = buildContextPrompt(contextSnapshot);
    const { text, finishReason, totalUsage, response } = await generateText({
      model: "google/gemini-3-flash",
      prompt,
      stopWhen: stepCountIs(5),
      tools: {
        google_search: google.tools.googleSearch({}),
      },
    });

    const llmContent = text.trim().slice(0, MAX_POST_CONTENT_LENGTH);

    if (llmContent.length === 0) {
      console.log("[BOT_CREATE_POST] LLM result", {
        text,
      });
      throw new Error(
        `LLM returned empty content (finishReason=${finishReason})`,
      );
    }

    console.info("[BOT_CREATE_POST] LLM content generated", {
      runId: response.id,
      botUserId,
      contextPostIds: {
        trigger: contextSnapshot.trigger.postId,
        parent: contextSnapshot.parent?.postId ?? null,
        root: contextSnapshot.root?.postId ?? null,
      },
      latencyMs: Date.now() - startedAt,
      finalFinishReason: finishReason,
      totalUsage,
    });

    return llmContent;
  } catch (error) {
    console.error("[BOT_CREATE_POST] LLM generation failed", {
      runId: null,
      botUserId,
      contextPostIds: {
        trigger: contextSnapshot.trigger.postId,
        parent: contextSnapshot.parent?.postId ?? null,
        root: contextSnapshot.root?.postId ?? null,
      },
      latencyMs: Date.now() - startedAt,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
    });
    throw error;
  }
}

async function createBotPost({
  botUserId,
  content,
  replyRootId,
  replyParentId,
}: {
  botUserId: string;
  content: string;
  replyRootId: string | null;
  replyParentId: string | null;
}) {
  "use step";

  return createPostWithSideEffects({
    actorUserId: botUserId,
    payload: {
      id: uuidv7(),
      creator_id: botUserId,
      content,
      media: [],
      media_length: 0,
      reply_root_id: replyRootId,
      reply_parent_id: replyParentId,
      quote_id: null,
    },
  });
}
