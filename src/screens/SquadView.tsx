import { useStore } from "@/store";
import { SQUAD, CREWS, COLLEAGUES, DEMO_USER, DEMO_PERSON_ID } from "@/data/orbit";
import Avatar from "@/components/Avatar";

export default function SquadView() {
  const { squadXp, squadPct, xp } = useStore();

  const members = SQUAD.memberIds.map((id) => {
    if (id === DEMO_PERSON_ID) {
      return {
        id,
        name: `${DEMO_USER.name} (you)`,
        role: DEMO_USER.role,
        avatarUrl: DEMO_USER.avatarUrl,
        initials: DEMO_USER.initials,
        accentHue: DEMO_USER.accentHue,
      };
    }
    const c = COLLEAGUES.find((col) => col.id === id)!;
    return {
      id: c.id,
      name: c.name,
      role: c.role,
      avatarUrl: c.avatarUrl,
      initials: c.initials,
      accentHue: c.accentHue,
    };
  });

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold font-display tracking-wide">🛡️ {SQUAD.name}</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Learning is a team sport — every mission and every card collected moves the squad bar.
      </p>

      <div className="mt-8 rounded-3xl border border-brand-panel bg-white/[0.04] p-7">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="font-semibold">Sprint goal: Insurance Fundamentals, together</div>
          <div className="text-sm text-muted-foreground">
            <span className="text-brand-lemon font-bold">{squadXp}</span> / {SQUAD.goalXp} squad XP
          </div>
        </div>
        <div className="mt-4 h-4 rounded-full bg-white/10 overflow-hidden">
          <div
            className="progress-fill h-full bg-gradient-to-r from-brand-magenta-dim via-brand-magenta to-brand-lemon"
            style={{ width: `${squadPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground/80">
          <span>{squadPct}% there</span>
          <span>Your contribution: {xp} XP</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 bg-white/5 border border-brand-panel rounded-full pl-1.5 pr-3 py-1"
            >
              <Avatar url={m.avatarUrl} initials={m.initials} accentHue={m.accentHue} size="xs" />
              <div className="leading-tight">
                <div className="text-xs font-medium">{m.name}</div>
                <div className="text-[0.6rem] text-muted-foreground/80">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Cross-functional crews</h2>
          <span className="text-[0.65rem] bg-brand-lemon/15 text-brand-lemon border border-brand-lemon/30 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
            Coming soon
          </span>
        </div>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Temporary teams that form around real work — collect crewmates faster by shipping
          together.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-4 opacity-70">
          {CREWS.map((cr) => (
            <div
              key={cr.id}
              className="rounded-2xl border border-dashed border-brand-panel-hover bg-white/[0.02] p-5"
            >
              <div className="text-2xl">🛰️</div>
              <div className="font-semibold mt-2 text-sm">{cr.name}</div>
              <div className="text-xs text-muted-foreground/80 mt-1">{cr.desc}</div>
              <div className="text-[0.65rem] text-muted-foreground/55 mt-3">{cr.memberCount} members</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
