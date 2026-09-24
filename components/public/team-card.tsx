import Image from "next/image";
import { FacebookIcon, LinkedInIcon } from "@/components/ui/icons";
import type { PublicTeamMember } from "@/lib/data";

export function TeamCard({ member }: { member: PublicTeamMember }) {
  const initials = member.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="group text-center">
      <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-2">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-ink/25">{initials}</div>
        )}
        {(member.facebook || member.linkedin) && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {member.facebook && (
              <a
                href={member.facebook}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`${member.name} — Facebook`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-night transition hover:bg-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`${member.name} — LinkedIn`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-night transition hover:bg-white"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
      <h3 className="mt-5 text-2xl font-medium">{member.name}</h3>
      <p className="mt-1 text-sm font-medium text-gold-strong">{member.designation}</p>
      {member.bio && <p className="mx-auto mt-3 line-clamp-3 max-w-xs text-sm text-muted">{member.bio}</p>}
    </article>
  );
}
