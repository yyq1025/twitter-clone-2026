import { Fragment, type ReactNode } from "react";
import ProfileHoverCard from "@/components/profile/profile-hover-card";
import { cn } from "@/lib/utils";
import { detectFacets } from "@/utils/post";

export type RichTextProps = {
  text: string;
  className?: string;
  mentionClassName?: string;
  as?: "p" | "span" | "div";
};

export function RichText({
  text,
  className,
  mentionClassName,
  as = "p",
}: RichTextProps) {
  const mentionFacets = detectFacets(text).filter(
    (facet) => facet.type === "mention",
  );
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const facet of mentionFacets) {
    const { utf16Start, utf16End, username } = facet;
    const isInvalidFacet =
      utf16Start < 0 ||
      utf16End > text.length ||
      utf16Start >= utf16End ||
      utf16Start < cursor;

    if (isInvalidFacet) {
      continue;
    }

    if (cursor < utf16Start) {
      nodes.push(
        <Fragment key={`text-${cursor}`}>
          {text.slice(cursor, utf16Start)}
        </Fragment>,
      );
    }

    const mentionText = text.slice(utf16Start, utf16End);

    nodes.push(
      <ProfileHoverCard
        key={`mention-${utf16Start}-${utf16End}`}
        username={username}
        trigger={
          <span
            className={cn("text-primary hover:underline", mentionClassName)}
          >
            {mentionText}
          </span>
        }
      />,
    );

    cursor = utf16End;
  }

  if (cursor < text.length) {
    nodes.push(
      <Fragment key={`text-${cursor}`}>{text.slice(cursor)}</Fragment>,
    );
  }

  const Component = as;

  return (
    <Component className={cn("whitespace-pre-wrap", className)}>
      {nodes.length > 0 ? nodes : text}
    </Component>
  );
}
