import type { CopyV2 } from '@/lib/content-v2';

/**
 * The courtyard study, drawn as vector from the FigCraft frame: same wall
 * positions, same 12 000 × 8 000 mm plot, same 3 600 mm court, same door swings.
 * Coordinates are the frame's own, shifted so the field starts at 0,0.
 */
export function PlanDrawing({ t }: { t: CopyV2 }) {
  const rooms = [
    { name: t.plan.rooms[0][0], note: t.plan.rooms[0][1], x: 264, y: 152 },
    { name: t.plan.rooms[1][0], note: t.plan.rooms[1][1], x: 556, y: 152 },
    { name: t.plan.rooms[2][0], note: t.plan.rooms[2][1], x: 191, y: 346 },
    { name: t.plan.rooms[3][0], note: t.plan.rooms[3][1], x: 581, y: 346 },
    { name: t.plan.rooms[4][0], note: t.plan.rooms[4][1], x: 386, y: 431 },
  ];

  return (
    <svg
      className="plan-drawing"
      viewBox="0 0 700 540"
      role="img"
      aria-label={t.plan.planCaption}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="0" y="0" width="700" height="540" fill="#123044" />
      <rect x="0.5" y="0.5" width="699" height="539" fill="none" stroke="#3d5a6c" strokeWidth="1" />

      {/* Outer walls: north (with three glazed bays), west, east, south (open to the court). */}
      <g className="wall">
        <rect x="86" y="86" width="60" height="12" />
        <rect x="256" y="86" width="70" height="12" />
        <rect x="436" y="86" width="50" height="12" />
        <rect x="596" y="86" width="90" height="12" />

        <rect x="86" y="98" width="12" height="388" />
        <rect x="674" y="98" width="12" height="388" />

        <rect x="86" y="474" width="40" height="12" />
        <rect x="236" y="474" width="60" height="12" />
        <rect x="476" y="474" width="60" height="12" />
        <rect x="646" y="474" width="40" height="12" />

        {/* Spine wall between the north rooms and the courtyard. */}
        <rect x="86" y="224" width="260" height="12" />
        <rect x="426" y="224" width="260" height="12" />

        {/* Courtyard side walls, split by two doors. */}
        <rect x="284" y="236" width="12" height="92" />
        <rect x="284" y="398" width="12" height="76" />
        <rect x="476" y="236" width="12" height="92" />
        <rect x="476" y="398" width="12" height="76" />

        {/* Partition between the two north rooms. */}
        <rect x="431" y="98" width="6" height="126" />
      </g>

      {/* Glazing: a single line where the wall is absent. */}
      <g className="glass">
        <line x1="146" y1="92" x2="256" y2="92" />
        <line x1="326" y1="92" x2="436" y2="92" />
        <line x1="486" y1="92" x2="596" y2="92" />
        <line x1="126" y1="480" x2="236" y2="480" />
        <line x1="536" y1="480" x2="646" y2="480" />
      </g>

      {/* Doors: leaf plus swing arc, as drawn. */}
      <g className="door">
        <line className="leaf" x1="346" y1="144" x2="346" y2="224" />
        <path d="M346 224 A80 80 0 0 1 426 144" />
        <line className="leaf" x1="226" y1="398" x2="296" y2="398" />
        <path d="M226 328 A70 70 0 0 1 296 398" />
        <line className="leaf" x1="476" y1="398" x2="546" y2="398" />
        <path d="M546 328 A70 70 0 0 0 476 398" />
      </g>

      {/* Courtyard tree, at the frame's own trunk position. */}
      <g>
        <path className="tree" d="M386 291c-34 0-62 28-62 62s28 63 62 63 63-29 63-63-29-62-63-62Z" />
        <circle className="tree" cx="386" cy="353" r="26" />
        <rect x="384" y="352" width="3" height="3" fill="#6f8f6a" />
      </g>

      {/* North point. */}
      <path d="M647 41 654 20 661 41Z" fill="#F2EFE6" />
      <text className="north" x="650" y="52">
        N
      </text>

      {/* Graphic scale. */}
      <g>
        <rect x="16" y="52" width="44" height="4" fill="#F2EFE6" />
        <rect x="60" y="52" width="44" height="4" fill="#4E6A7B" />
        <rect x="104" y="52" width="44" height="4" fill="#F2EFE6" />
        <rect x="148" y="52" width="44" height="4" fill="#4E6A7B" />
        <rect x="192" y="52" width="44" height="4" fill="#F2EFE6" />
        <text className="scale-note" x="16" y="66">
          0
        </text>
        <text className="scale-note" x="236" y="66">
          5 M
        </text>
      </g>

      {rooms.map((room) => (
        <g key={room.name}>
          <text className="room" x={room.x} y={room.y} textAnchor="middle">
            {room.name}
          </text>
          <text className="room-note" x={room.x} y={room.y + 12} textAnchor="middle">
            {room.note}
          </text>
        </g>
      ))}

      {/* Dimensions: overall width, overall depth, and the 3 600 court. */}
      <g className="thin">
        <line x1="86" y1="512" x2="686" y2="512" />
        <line x1="86" y1="506" x2="86" y2="518" />
        <line x1="686" y1="506" x2="686" y2="518" />
      </g>
      <text className="dim" x="358" y="504" textAnchor="middle">
        {t.plan.dimWidth}
      </text>

      <g className="thin">
        <line x1="56" y1="98" x2="56" y2="486" />
        <line x1="50" y1="98" x2="62" y2="98" />
        <line x1="50" y1="486" x2="62" y2="486" />
      </g>
      <text className="dim" x="26" y="292" textAnchor="middle" transform="rotate(-90 26 292)">
        {t.plan.dimDepth}
      </text>

      <g className="thin">
        <line x1="296" y1="276" x2="476" y2="276" />
        <line x1="296" y1="270" x2="296" y2="282" />
        <line x1="476" y1="270" x2="476" y2="282" />
      </g>
      <text className="dim-court" x="386" y="270" textAnchor="middle">
        {t.plan.dimCourt}
      </text>
      <text className="dim-name" x="386" y="258" textAnchor="middle">
        {t.plan.dimCourtName}
      </text>
    </svg>
  );
}
